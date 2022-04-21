const btnUpdate = document.getElementById("btnUpdate");

btnUpdate.addEventListener("click", async (e) => {
  e.preventDefault();
  const data = document.querySelectorAll("input");

  const email = data[0].value;
  const nombre = data[1].value;
  const password = data[2].value;
  const passwordRepeat = data[3].value;
  const experiencia = data[4].value;
  const especialidad = data[5].value;

  // query
  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  const idUser = urlParams.get("id");

  console.log(idUser);

  const payload = {
    idUser,
    email,
    nombre,
    password,
    passwordRepeat,
    experiencia,
    especialidad,
  };

  try {
    const data = axios.post("/update", payload);
    const res = await data;
    console.log("AAAAA", res.data.nombre);
    if (res.status === 200) {
      alert(`User update: ${nombre}`);
      window.location.href = `/admin`;
    }
  } catch (err) {
    console.log(err);
    alert(`Password don't match`);
  }
});
