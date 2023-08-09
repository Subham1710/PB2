/*Data Manipulation:
Given a list of restaurants, each with a name, cuisine type, 
rating, and number of reviews, write a function that returns the top 5 restaurants by rating. If there are multiple restaurants with the same rating,
 sort them by the number of reviews. */


function topFiveRestaurants(restaurants) {
    return restaurants.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 5);
}


//Asynchronous Operations: Zomato often deals with numerous restaurant listings and reviews.
//How would you handle fetching details of 100 restaurants concurrently? 
//Implement a function that can manage multiple asynchronous API calls efficiently.

async function fetchRestaurantDetails(restaurantIds) {
    const promises = restaurantIds.map(id => fetch(`/api/restaurant/${id}`).then(res => res.json()));
    const results = await Promise.all(promises);
    return results;
}



//Alternative Function!!!!!!!!!!

async function fetchRestaurantDetails(restaurantIds, maxRequests = 10, timeout = 5000) {
    const fetchWithTimeout = (url, options, timeout) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), timeout)
            )
        ]);
    };

    const fetchSingleDetail = async (id) => {
        try {
            const response = await fetchWithTimeout(`/api/restaurant/${id}`, {}, timeout);
            if (!response.ok) {
                throw new Error(`Failed to fetch for ID: ${id}. Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching details for restaurant ID: ${id}.`, error);
            return null;
        }
    };

    const chunkedRequests = [];
    for (let i = 0; i < restaurantIds.length; i += maxRequests) {
        chunkedRequests.push(restaurantIds.slice(i, i + maxRequests));
    }

    const results = [];
    for (const chunk of chunkedRequests) {
        const promises = chunk.map(fetchSingleDetail);
        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults.filter(r => r !== null));
    }

    return results;
}

// Usage:
// fetchRestaurantDetails([1,2,3,4,...])
