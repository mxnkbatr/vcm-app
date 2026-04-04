import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUserId } from '@/lib/authHelpers';

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { documents } = await req.json();

        if (!documents) {
            return NextResponse.json({ error: 'No documents provided' }, { status: 400 });
        }

        await connectToDB();

        const result = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    documents,
                    documentsSubmitted: true,
                    updatedAt: new Date(),
                },
            },
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Documents submitted successfully' });
    } catch (error) {
        console.error('Submit documents error:', error);
        return NextResponse.json({ error: 'Failed to submit documents' }, { status: 500 });
    }
}
