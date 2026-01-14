export const submitUsername = async (session, username) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profiles/username`, {
    method: 'POST',
    headers: { 
        Authorization: `Bearer ${session.access_token}`, 
        'Content-Type': 'application/json', 
    },
    body: JSON.stringify({ username })
  });

  const data = await res.json(); 

  return data;
};

export const getUsername = async (session) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profiles/username`, {
    method: 'GET',
    headers: { 
        Authorization: `Bearer ${session.access_token}`, 
        'Content-Type': 'application/json', 
    },
  });

  const data = await res.json(); 

  return data;
};