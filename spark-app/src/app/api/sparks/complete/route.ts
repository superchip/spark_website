import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sparkId, goalId, sessionId, notes } = body

    if (!sparkId || !goalId || !sessionId) {
      return NextResponse.json({ error: 'Spark ID, goal ID, and session ID are required' }, { status: 400 })
    }

    // Check if spark was already completed by this user
    const { data: existing } = await supabase
      .from('spark_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('spark_id', sparkId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Spark already completed' }, { status: 400 })
    }

    // Create spark completion
    const { data: completion, error: completionError } = await supabase
      .from('spark_completions')
      .insert({
        user_id: user.id,
        spark_id: sparkId,
        goal_id: goalId,
        session_id: sessionId,
        notes: notes || null,
      })
      .select()
      .single()

    if (completionError) {
      console.error('Error creating completion:', completionError)
      return NextResponse.json({ error: completionError.message }, { status: 500 })
    }

    // Increment goal's spark count using the helper function
    const { error: incrementError } = await supabase.rpc('increment_goal_sparks', {
      goal_uuid: goalId
    })

    if (incrementError) {
      console.error('Error incrementing goal sparks:', incrementError)
    }

    return NextResponse.json({ completion })
  } catch (error: any) {
    console.error('Error completing spark:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
