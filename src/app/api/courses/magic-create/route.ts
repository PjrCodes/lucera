import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { auth } from '@/auth';
import { NextAuthRequest } from 'next-auth';
import client from '@/lib/db';

import { PdfReader } from "pdfreader";
import { ObjectId } from 'mongodb';
import { LLMSyllabusParse } from '@/lib/llm';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function readPdfText(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let allText = '';
        new PdfReader().parseFileItems(filePath, (err, item) => {
            if (err) {
                reject(err);
            } else if (!item) {
                // End of file
                resolve(allText);
            } else if (item.text) {
                allText += item.text + " ";
            }
        });
    });
}

// Example: Parse a course file and create a course object
export const POST = auth(async function POST(req: NextAuthRequest) {

    if (!req.auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = req.auth;
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { fileId } = await req.json();

        if (!fileId) {
            return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
        }

        console.log("Received fileId:", new ObjectId(fileId));
        // query from the database to get the file path
        const db = client.db();
        const collection = db.collection('files');
        const fileRecord = await collection.findOne({ _id: new ObjectId(fileId) });
        if (!fileRecord) {
            return NextResponse.json({ error: 'File object not found' }, { status: 404 });
        }
        
        const filePath = fileRecord.path;

        console.log("File path:", filePath);
        // ensure the file exists
        try {
            await fs.access(filePath);
        }
        catch (error) {
            return NextResponse.json({ error: 'File does not exist', detailedError: error }, { status: 404 });
        }
        
        // const allText = await readPdfText(filePath);
    
        // Call LLM parse apis
        const { timeline, units, courseStartDate, courseEndDate, name, description, shortDescription } = await LLMSyllabusParse(filePath);


        const courseCollection = db.collection('courses');
        const courseRecord = await courseCollection.insertOne({
            name: name || "Unnamed Course",
            description: description || "No description provided",
            shortDescription: shortDescription || "No short description provided",
            syllabusFileId: fileId,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: session.user.id, // Assuming the user ID is available in the auth object
            timeline: timeline || [],
            units: units || [],
            cover_image: null,
            status: 'draft',
            isPublished: false,
            courseStartDate: courseStartDate || null,
            courseEndDate: courseEndDate || null,
        })
        if (!courseRecord.acknowledged) {
            return NextResponse.json({ error: 'Failed to create course record' }, { status: 500 });
        }

        return NextResponse.json({ success: true, courseId: courseRecord.insertedId });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
});