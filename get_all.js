const getAllItems = async () => {
    const res = await fetch('http://localhost:3000/api/food-menu');
    const items = await res.json();
    console.log("All Menu Items:", JSON.stringify(items, null, 2));
}
getAllItems();
