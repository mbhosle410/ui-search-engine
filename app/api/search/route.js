import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Component from '@/models/Component';

export async function GET(request) {
  await dbConnect();
  
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  // Return empty array if no query
  if (!query) return NextResponse.json({ data: [] });

  try {
    const searchRegex = new RegExp(query, 'i'); // Case insensitive search

    const results = await Component.find({
      $or: [
        { name: { $regex: searchRegex } },
        { keywords: { $in: [searchRegex] } },
        { library: { $regex: searchRegex } }
      ]
    })
    .sort({ popularityScore: -1 }) // Most popular first
    .limit(20);

    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}