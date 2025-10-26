import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSpark } from '@/lib/anthropic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { goalId, goalTitle, goalDescription } = body

    if (!goalId || !goalTitle) {
      return NextResponse.json({ error: 'Goal ID and title are required' }, { status: 400 })
    }

    // Get previous sparks for this goal
    const { data: previousSparks } = await supabase
      .from('sparks')
      .select('*')
      .eq('goal_id', goalId)
      .order('sequence_number', { ascending: true })

    // Generate new spark using Claude
    const sparkData = await generateSpark({
      goalTitle,
      goalDescription,
      previousSparks: previousSparks || [],
    })

    // Get the next sequence number
    const nextSequence = (previousSparks?.length || 0) + 1

    // Save spark to database
    const { data: spark, error: insertError } = await supabase
      .from('sparks')
      .insert({
        goal_id: goalId,
        title: sparkData.title,
        description: sparkData.description,
        effort_minutes: parseInt(sparkData.effort.match(/\d+/)?.[0] || '3'),
        resource_link: sparkData.resourceLink,
        sequence_number: nextSequence,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving spark:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ spark })
  } catch (error: any) {
    console.error('Error generating spark:', error)
    return NextResponse.json({ error: 'Failed to generate spark' }, { status: 500 })
  }
}
