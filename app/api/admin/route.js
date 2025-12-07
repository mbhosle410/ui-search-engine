import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';
import Component from '@/models/Component';

// 1. GET: Fetch all pending submissions
export async function GET(request) {
  await dbConnect();
  
  // Simple Security Check (via Query Param)
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== '1234') { // ⚠️ CHANGE THIS PIN LATER
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const submissions = await Submission.find({ status: 'pending' }).sort({ createdAt: -1 });
  return NextResponse.json(submissions);
}

// 2. POST: Handle Approve or Reject
export async function POST(request) {
  await dbConnect();
  const { id, action, secret } = await request.json();

  if (secret !== '1234') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (action === 'reject') {
      // Just delete it
      await Submission.findByIdAndDelete(id);
      return NextResponse.json({ message: 'Rejected' });
    } 
    
    if (action === 'approve') {
      // Find the submission data
      const sub = await Submission.findById(id);
      
      if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      // Create a NEW Component in the live DB
      await Component.create({
        name: sub.name,
        library: sub.library,
        framework: sub.framework,
        docUrl: sub.docUrl,
        // Auto-generate some basic keywords to start
        keywords: [sub.name.toLowerCase(), sub.library.toLowerCase()],
        popularityScore: 50
      });

      // Delete the submission (cleanup)
      await Submission.findByIdAndDelete(id);
      
      return NextResponse.json({ message: 'Approved and Live!' });
    }

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}