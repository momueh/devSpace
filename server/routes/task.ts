import { Hono } from 'hono';
import { db } from '../db';
import { task } from '../db/schema/task';
import { and, eq } from 'drizzle-orm';
import { insertTaskSchema } from '../db/schema/task';
import { project } from '../db/schema/project';
import { requireAuth } from '../auth/middleware';
import { sendEmail } from '../email';
import { comment, insertCommentSchema } from '../db/schema/comment';
import { insertNoteSchema, note } from '../db/schema/note';

export const taskRoute = new Hono()
  .use('/*', requireAuth)
  // Create new task
  .post('/', async (c) => {
    const data = await c.req.json();
    const user = c.var.user;

    try {
      const validatedData = insertTaskSchema.parse(data);
      const [newTask] = await db.insert(task).values(validatedData).returning();

      return c.json(newTask);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create task' }, 500);
    }
  })

  // Update task
  .patch('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await c.req.json();
    const user = c.var.user;

    try {
      // Check if task belongs to user's project
      const taskResult = await db.query.task.findFirst({
        where: eq(task.id, id),
        with: {
          project: true,
        },
      });

      if (!taskResult) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      const [updated] = await db
        .update(task)
        .set(data)
        .where(eq(task.id, id))
        .returning();

      return c.json(updated);
    } catch (error) {
      return c.json({ error: 'Failed to update task' }, 500);
    }
  })

  // Delete task
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const user = c.var.user;

    try {
      // Check if task belongs to user's project
      const taskResult = await db.query.task.findFirst({
        where: eq(task.id, id),
        with: {
          project: true,
        },
      });

      if (!taskResult) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      await db.delete(task).where(eq(task.id, id));
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Failed to delete task' }, 500);
    }
  })

  // Comments

  .post('/:id/comments', async (c) => {
    const taskId = Number(c.req.param('id'));
    const user = c.var.user;
    const data = await c.req.json();

    try {
      const validatedData = insertCommentSchema.parse({
        content: data.content,
        taskId,
        authorId: user.id,
      });

      const [newComment] = await db
        .insert(comment)
        .values(validatedData)
        .returning({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          authorId: comment.authorId,
        });

      return c.json(newComment);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create comment' }, 500);
    }
  })

  // Notes
  .post('/:id/notes', async (c) => {
    const taskId = Number(c.req.param('id'));
    const user = c.var.user;
    const data = await c.req.json();

    try {
      const validatedData = insertNoteSchema.parse({
        content: data.content,
        taskId,
        authorId: user.id,
      });

      const [newNote] = await db.insert(note).values(validatedData).returning({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        authorId: note.authorId,
      });

      return c.json(newNote);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create note' }, 500);
    }
  })

  .patch('/:taskId/notes/:noteId', async (c) => {
    const taskId = Number(c.req.param('taskId'));
    const noteId = Number(c.req.param('noteId'));
    const user = c.var.user;
    const data = await c.req.json();

    try {
      // Verify the note belongs to the user
      const existingNote = await db.query.note.findFirst({
        where: and(
          eq(note.id, noteId),
          eq(note.taskId, taskId),
          eq(note.authorId, user.id)
        ),
      });

      if (!existingNote) {
        return c.json({ error: 'Note not found or unauthorized' }, 403);
      }

      const [updatedNote] = await db
        .update(note)
        .set({
          content: data.content,
          updatedAt: new Date(),
        })
        .where(eq(note.id, noteId))
        .returning({
          id: note.id,
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          authorId: note.authorId,
        });

      return c.json(updatedNote);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to update note' }, 500);
    }
  })

  .delete('/:taskId/notes/:noteId', async (c) => {
    const taskId = Number(c.req.param('taskId'));
    const noteId = Number(c.req.param('noteId'));
    const user = c.var.user;

    try {
      // Verify the note belongs to the user
      const existingNote = await db.query.note.findFirst({
        where: and(
          eq(note.id, noteId),
          eq(note.taskId, taskId),
          eq(note.authorId, user.id)
        ),
      });

      if (!existingNote) {
        return c.json({ error: 'Note not found or unauthorized' }, 403);
      }

      await db.delete(note).where(eq(note.id, noteId));

      return c.json({ success: true });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to delete note' }, 500);
    }
  });
