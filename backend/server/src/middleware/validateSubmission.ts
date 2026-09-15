import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

// Dangerous extensions rejected outright, regardless of what the
// assignment's allowedFileTypes configuration says (Task 17: "Dangerous
// file types are rejected" is a hard rule, not a per-assignment setting).
const DANGEROUS_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".msi", ".dll", ".scr", ".js", ".vbs"];

export async function validateSubmissionUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const { assignmentId, attachments } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ error: "assignmentId is required" });
    }

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (Array.isArray(attachments)) {
      for (const file of attachments) {
        const hasDangerousExt = DANGEROUS_EXTENSIONS.some((ext) =>
          file.fileName?.toLowerCase().endsWith(ext)
        );
        if (hasDangerousExt) {
          return res.status(400).json({
            error: `File type not allowed: ${file.fileName}`,
          });
        }

        if (!assignment.allowedFileTypes.includes(file.fileType)) {
          return res.status(400).json({
            error: `File type ${file.fileType} is not permitted for this assignment`,
          });
        }

        const maxBytes = assignment.maxFileSizeMb * 1024 * 1024;
        if (file.fileSizeBytes > maxBytes) {
          return res.status(400).json({
            error: `File ${file.fileName} exceeds the ${assignment.maxFileSizeMb}MB limit`,
          });
        }
      }

      if (!assignment.allowMultipleFiles && attachments.length > 1) {
        return res.status(400).json({
          error: "This assignment only allows a single file per submission",
        });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}