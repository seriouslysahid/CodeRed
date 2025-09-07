// app/api/test-supabase-import/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing Supabase import...');
    
    // Try to import supabaseAdmin
    const { supabaseAdmin } = await import('@/lib/supabase');
    console.log('Supabase admin imported successfully');
    
    // Try a simple query
    const { data, error } = await supabaseAdmin
      .from('learners')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ 
        message: 'Supabase import successful but query failed',
        error: error.message 
      });
    }
    
    console.log('Supabase query successful:', data);
    return NextResponse.json({ 
      message: 'Supabase import and query successful',
      data 
    });
    
  } catch (error) {
    console.error('Supabase import error:', error);
    return NextResponse.json({ 
      message: 'Supabase import failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
