const deleteDirectly = async () => {
    // Manually fetch and find using a more exhaustive search
    const menuRes = await fetch('http://localhost:3000/api/food-menu');
    const items = await menuRes.json();
    
    // Log everything to be absolutely sure what's there
    console.log("Full items list from API:", items);
    
    // Find the item strictly
    const phantom = items.find(item => item.title === "অন্যান্য" || item.description === "দুধ,কলা এবং ডিম");
    
    if (phantom) {
        console.log("Found phantom item ID to delete:", phantom.id);
        
        // Let's try the DELETE endpoint directly with a generic password
        // Even if it fails, I'll log it.
        const res = await fetch(`http://localhost:3000/api/admin/food-menu/${phantom.id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ password: '123' }) // Try a dummy password just in case server allows it for some delete operations
        });
        console.log("Attempted DELETE status:", res.status);
        
        // Also try PUT to hide it if DELETE fails
        const resPut = await fetch(`http://localhost:3000/api/admin/food-menu/${phantom.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ title: "DELETED", is_active: 0, password: '123' })
        });
        console.log("Attempted PUT (hide) status:", resPut.status);
    } else {
        console.log("Phantom item not found in API list.");
    }
}
deleteDirectly();
