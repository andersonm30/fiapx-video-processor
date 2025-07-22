import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum VideoStatus {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

@Entity()
export class Video {
  @PrimaryGeneratedColumn("uuid") // Se quiser string UUID, senão use só @PrimaryGeneratedColumn() para number
  id!: string;

  @Column({ type: "text", nullable: false })
  originalPath!: string;

  @Column({ type: "enum", enum: VideoStatus, nullable: false })
  status!: VideoStatus;

  @Column({ type: "text", nullable: true })
  outputPath?: string;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;
}
