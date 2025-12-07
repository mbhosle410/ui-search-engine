import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';

export async function POST(request) {
  try {
    // 1. Connect to DB
    await dbConnect();

    // 2. Get data from the form
    const body = await request.json();
    const { name, library, framework, docUrl } = body;

    // 3. Simple Validation
    if (!name || !library || !docUrl) {
      return NextResponse.json(
        { error: 'Please fill in all fields' },
        { status: 400 }
      );
    }

    // 4. Save to Database
    await Submission.create({
      name,
      library,
      framework,
      docUrl
    });

    return NextResponse.json({ message: 'Submission Received!' }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}