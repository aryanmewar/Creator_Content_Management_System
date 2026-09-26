

async function test() {
  try {
    // First login to get token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@createlyt.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log("Login:", loginData);
    
    // We need the cookie. 
    const cookie = loginRes.headers.get('set-cookie');
    
    // Get content to find a DRAFT
    const contentRes = await fetch('http://localhost:5000/api/content?status=DRAFT', {
      headers: { 'Cookie': cookie }
    });
    const contentData = await contentRes.json();
    console.log("Content fetch success:", contentData.success, "count:", contentData.data?.length);
    
    if (contentData.data && contentData.data.length > 0) {
      const draft = contentData.data[0];
      console.log("Draft ID:", draft._id, "Current Status:", draft.status);
      
      // Try to update status to ASSIGNED
      const updateRes = await fetch(`http://localhost:5000/api/content/${draft._id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': cookie
        },
        body: JSON.stringify({ status: 'ASSIGNED' })
      });
      
      const updateData = await updateRes.json();
      console.log("Update response:", updateRes.status, updateData);
    }
  } catch(e) {
    console.error(e);
  }
}
test();
