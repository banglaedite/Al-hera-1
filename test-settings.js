import fetch from 'node-fetch';
(async () => {
  const res = await fetch('http://localhost:3000/api/site-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test',
      description: 'Test',
      hero_image: 'Test',
      logo_url: 'Test',
      contact_phone: 'Test',
      whatsapp_number: 'Test',
      facebook_url: 'Test',
      announcement: 'Test',
      bkash_number: 'Test',
      nagad_number: 'Test',
      enable_recruitment: 1,
      address: 'Test',
      smtp_host: 'Test',
      smtp_port: 587,
      smtp_user: 'Test',
      smtp_pass: 'Test',
      sender_email: 'Test',
      firebase_service_account: 'Test',
      show_features_as_buttons: 1,
      show_food_as_buttons: 1,
      show_showcase_as_buttons: 1,
      showcase_content: '[]'
    })
  });
  console.log(await res.json());
})();
