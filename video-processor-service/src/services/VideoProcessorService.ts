import ffmpeg from 'fluent-ffmpeg';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../config/database';
import { Video, VideoStatus } from '../models/Video';

export class VideoProcessorService {
  private videoRepository = AppDataSource.getRepository(Video);

  async processVideo(videoId: number): Promise<void> {
    const video = await this.videoRepository.findOne({ where: { id: videoId.toString() } });
    
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    try {
      await this.videoRepository.update(videoId, { 
        status: VideoStatus.PROCESSING 
      });

      const outputDir = path.join('/app/processed', `video_${videoId}`);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      await this.extractFrames(video.originalPath, outputDir, videoId);
      const zipPath = await this.createZip(outputDir, videoId);

      await this.videoRepository.update(videoId, {
        status: VideoStatus.COMPLETED,
        outputPath: zipPath
      });

      console.log(`✅ Video ${videoId} processed successfully`);

    } catch (error) {
      console.error(`❌ Error processing video ${videoId}:`, error);
      
      await this.videoRepository.update(videoId, {
        status: VideoStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private async extractFrames(inputPath: string, outputDir: string, videoId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(path.join(outputDir, 'frame_%04d.png'))
        .outputOptions(['-vf', 'fps=1'])
        .on('end', () => {
          console.log(`📸 Frames extracted for video ${videoId}`);
          resolve();
        })
        .on('error', reject)
        .run();
    });
  }

  private async createZip(sourceDir: string, videoId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const zipPath = path.join('/app/processed', `video_${videoId}_frames.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`📦 ZIP created for video ${videoId}`);
        resolve(zipPath);
      });

      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
}