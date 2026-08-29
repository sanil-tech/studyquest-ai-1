const args = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api_key': 'b634df8dc2874d42a26e406c5e258f54'
  },
  body: JSON.stringify({ args: {} })
};

fetch('http://localhost:3000/api/base44/functions/invoke/unapproveAllLessons', args)
  .then(async res => {
    console.log(res.status, res.statusText);
    const text = await res.text();
    console.log(text);
  })
  .catch(console.error);
