
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqixrxekeihtzvjvcvth.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXhyeGVrZWlodHp2anZjdnRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mzc3MDEsImV4cCI6MjA3OTAxMzcwMX0.RTmK5Tkz1TmlIFQx1q4uXBG1AKXP9FQ7r5TOomjq2Fo';

export const supabase = createClient(supabaseUrl, supabaseKey);
