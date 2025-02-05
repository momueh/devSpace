// types that need to be created inside the db will be in schema/dbtypes.ts
export const ContentStatus = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    UNLISTED: 'unlisted',
} as const;

export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];
