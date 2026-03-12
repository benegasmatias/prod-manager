import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
}

export async function GET(request: Request) {
    const supabase = await createClient()
    await supabase.auth.signOut()

    const { origin } = new URL(request.url)
    revalidatePath('/', 'layout')
    return NextResponse.redirect(`${origin}/login`)
}
