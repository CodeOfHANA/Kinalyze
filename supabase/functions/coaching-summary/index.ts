import Groq from 'npm:groq-sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map joint name fragments → external coaching cues (based on physio research)
const JOINT_CUES: Record<string, string> = {
  knee:     'think of pushing your knees outward over your little toes',
  shoulder: 'imagine your shoulder blades sliding down and back like wings folding',
  elbow:    'keep your elbows pointing toward the floor, not flaring outward',
  hip:      'drive your hips back as if reaching for a chair just behind you',
  ankle:    'press evenly through your whole foot, from heel to big toe',
  wrist:    'keep your wrists in line with your forearms — no drooping',
  spine:    'imagine a rod running from your tailbone to the crown of your head',
  back:     'imagine a rod running from your tailbone to the crown of your head',
}

function getExternalCue(jointName: string): string {
  const lower = jointName.toLowerCase()
  for (const [key, cue] of Object.entries(JOINT_CUES)) {
    if (lower.includes(key)) return cue
  }
  return 'focus on controlled, deliberate movement through the full range'
}

function formatJointName(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function buildPrompt(body: {
  exerciseId: string
  exerciseName: string
  overallAccuracy: number
  repCount: number
  jointResults: { joint_name: string; accuracy_pct: number; correction_count: number }[]
}): { system: string; user: string } {
  const { exerciseName, overallAccuracy, repCount, jointResults } = body

  const sorted = [...jointResults].sort((a, b) => a.accuracy_pct - b.accuracy_pct)
  const weakest = sorted[0]
  const jointLines = sorted
    .map(j => `  - ${formatJointName(j.joint_name)}: ${j.accuracy_pct}% accurate, corrected ${j.correction_count} times`)
    .join('\n')

  const externalCue = weakest ? getExternalCue(weakest.joint_name) : null
  const cueHint = externalCue && weakest
    ? `The primary correction for ${formatJointName(weakest.joint_name)} should use this external cue: "${externalCue}".`
    : ''

  const system = `You are a physiotherapy coach assistant giving post-session feedback. Your coaching must be:
- Specific: reference the actual joint name and accuracy percentage
- Externally cued: describe what the body does, not what muscles to activate
- Positive but direct: acknowledge effort, be honest about corrections
- Concise: exactly 3 sentences, no lists, no headers, no markdown
- Safe: never diagnose, never make medical claims, never promise outcomes`

  const user = `Exercise: ${exerciseName}
Overall accuracy: ${overallAccuracy}% (${repCount} reps completed)
Joint breakdown (worst first):
${jointLines}
${cueHint}

Write a 3-sentence coaching summary for this session.`

  return { system, user }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    const { exerciseId, exerciseName, overallAccuracy, repCount, jointResults } = body
    if (!exerciseId || overallAccuracy === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: exerciseId, overallAccuracy' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const groq = new Groq({ apiKey })
    const { system, user } = buildPrompt({ exerciseId, exerciseName, overallAccuracy, repCount, jointResults })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user },
      ],
      temperature: 0.6,
      max_tokens: 200,
    })

    const coaching = completion.choices[0]?.message?.content?.trim() ?? ''

    return new Response(
      JSON.stringify({ coaching }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('coaching-summary error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
