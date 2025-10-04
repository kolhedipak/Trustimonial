const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testShareLinkFlow() {
  try {
    console.log('🧪 Testing Share Link Flow...\n');

    // 1. Login to get auth token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@trustimonials.com',
      password: 'Passw0rd!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Get spaces to find a space ID
    console.log('2. Getting spaces...');
    const spacesResponse = await axios.get(`${API_BASE}/api/dashboard/spaces`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const spaces = spacesResponse.data.spaces;
    if (spaces.length === 0) {
      console.log('❌ No spaces found. Please create a space first.');
      return;
    }
    
    const spaceId = spaces[0].id;
    console.log(`✅ Found space: ${spaces[0].name} (ID: ${spaceId})\n`);

    // 3. Create a share link
    console.log('3. Creating share link...');
    const shareLinkResponse = await axios.post(`${API_BASE}/api/spaces/${spaceId}/share-links`, {
      collectionType: 'text-and-video',
      language: 'en',
      requireCaptcha: false,
      collectExtras: ['name', 'email']
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const shareLink = shareLinkResponse.data.shareLink;
    console.log(`✅ Share link created: ${shareLink.publicUrl}\n`);

    // 4. Test public access to share link
    console.log('4. Testing public access...');
    const publicResponse = await axios.get(`${API_BASE}/s/${shareLink.slug}`);
    console.log(`✅ Public access successful. Space: ${publicResponse.data.space.name}\n`);

    // 5. Test public submission
    console.log('5. Testing public submission...');
    const submissionResponse = await axios.post(`${API_BASE}/s/${shareLink.slug}/submissions`, {
      name: 'Test User',
      email: 'test@example.com',
      content: 'This is a test testimonial submission!',
      rating: 5
    });
    
    console.log(`✅ Submission successful. ID: ${submissionResponse.data.submissionId}\n`);

    // 6. Get share links for the space
    console.log('6. Getting share links...');
    const shareLinksResponse = await axios.get(`${API_BASE}/api/spaces/${spaceId}/share-links`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${shareLinksResponse.data.shareLinks.length} share links\n`);

    console.log('🎉 All tests passed! Share link feature is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testShareLinkFlow();
