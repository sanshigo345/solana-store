export const addOrder = async (order) => {
    console.log("adding order ", order, "To DB");
    await fetch("../api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
  };