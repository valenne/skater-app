const changeStatus = async (id, status) => {
  const estado = status.checked;

  try {
    await axios.put("/skaters/change", {
      id,
      estado,
    });

    if (estado) {
      alert("skater is now active");
      console.log("skater is now active");
    } else {
      alert("skater is now inactive");
      console.log("skater is now inactive");
    }
  } catch ({ response }) {
    const { data } = response;
    const { error } = data;
    alert(error);
  }
};
