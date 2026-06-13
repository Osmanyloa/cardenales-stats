import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lplinljgsnspxmrairvb.supabase.co'
const supabaseKey = 'sb_publishable_cecw938NFaqvGDRRiWJAhg_h47vPRsY'

export const supabase = createClient(supabaseUrl, supabaseKey)