 export async function api(path, options = {}) {
   const headers = options.body instanceof FormData
     ? options.headers || {}
     : {
       "Content-Type": "application/json",
       ...(options.headers || {}),
     };

   const res = await fetch(`http://localhost:8000/api${path}`, {
     credentials: "include",
     headers,
     ...options,
   });

   if (res.status === 401) {
     localStorage.removeItem("auth");
     throw new Error("Unauthorized - redirecting to login");
   }

   if (!res.ok) {
     const message = await res.text();
     throw new Error(message || res.statusText);
   }

   return res.status === 204 ? null : res.json();
 }
