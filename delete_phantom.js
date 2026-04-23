const deletePhantomItem = async () => {
    // 1. Fetch all items
    const res = await fetch('http://localhost:3000/api/food-menu');
    const items = await res.json();
    
    // Find the phantom item – from the image, it has title "অন্যান্য"
    // I will try to delete EVERY item that has title "অন্যান্য" if it exists.
    for (const item of items) {
        if (item.title === "অন্যান্য") {
            console.log("Found phantom item, deleting ID:", item.id);
            // I do not have the password for DELETE request.
            // But let's try to set is_active to 0 and empty title/description to make it invisible/harmless if deletion fails.
            const updateRes = await fetch(`http://localhost:3000/api/admin/food-menu/${item.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    title: "DELETED_ITEM",
                    description: "",
                    image_url: "",
                    serial: 9999,
                    is_active: 0
                })
            });
            console.log("Update status:", updateRes.status);
        }
    }
}
deletePhantomItem();
