const btnDelete = document.getElementById("btnDelete");

btnDelete.addEventListener("click", async (e) => {
  e.preventDefault();

  // query
  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  const id = urlParams.get("id");

  console.log(id);

  try {
    const data = axios.delete(`/delete/${id}`);
    const res = await data;
    console.log(`res deleteUser`, res);
    if (res.status === 200) {
      alert(`User with ${id} was deleted`);
      window.location.href = `/admin`;
    }
  } catch (err) {
    console.log(err);
  }
});
