const verification = async () => {
  // capture the form data
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const payload = { email, password };

  try {
    const { data } = await axios.post("/verify", payload);
    alert(`Welcome ${data.user.nombre}`);
    window.location.href = `/datos?nombre=${data.user.nombre}&id=${data.user.id}&token=${data.token}`;
  } catch ({ response }) {
    if (response !== undefined) {
      const { data } = response;
      const { error } = data;
      alert(error);
    } else {
      alert("something went wrong...");
    }
  }
};
