
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqixrxekeihtzvjvcvth.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXhyeGVrZWlodHp2anZjdnRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mzc3MDEsImV4cCI6MjA3OTAxMzcwMX0.RTmK5Tkz1TmlIFQx1q4uXBG1AKXP9FQ7r5TOomjq2Fo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Attempting to sign up with ${email}...`);
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Signup error:', error);
    } else {
        console.log('Signup successful:', data);
        if (data.session) {
            console.log('Session received immediately (Email confirmation NOT required).');
        } else if (data.user && !data.session) {
            console.log('User created but no session (Email confirmation REQUIRED).');
        }
    }
}

testSignup();
