const apiUrl = 'https://script.google.com/macros/s/AKfycby7hrL602t-a__b8V-_erIz6mGMibSJNRj61Au1BiohTjg2_1TRN2UC_c5KsNUNNf4a/exec';
const messageForm = document.getElementById('message-form');
const messagesContainer = document.getElementById('messages-container');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');

// Function to fetch and display messages
const getMessages = async () => {
    // Clear existing messages
    messagesContainer.innerHTML = '<h2>Messages</h2><p>Loading...</p>';
    try {
        const response = await fetch(apiUrl);
        const messages = await response.json();

        // Clear loading text
        messagesContainer.innerHTML = '<h2>Messages</h2>';

        if (messages.length === 0) {
            messagesContainer.innerHTML += '<p>No messages yet. Be the first to post!</p>';
        } else {
            // Sort messages by likes in descending order
            messages.sort((a, b) => b.likes - a.likes);

            messages.forEach(msg => {
                const card = document.createElement('div');
                card.className = 'message-card';
                card.innerHTML = `
                    <p class="message-content">${msg.message}</p>
                    <p class="author">- ${msg.name}</p>
                    <div class="like-section">
                        <button class="like-button" data-id="${msg.id}">❤️ Like</button>
                        <span class="like-count">${msg.likes}</span>
                    </div>
                `;
                messagesContainer.appendChild(card);
            });
        }
    } catch (error) {
        messagesContainer.innerHTML += '<p>Failed to load messages. Please try again later.</p>';
        console.error('Error fetching messages:', error);
    }
};

// Function to handle form submission
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (name === '' || message === '') {
        alert('Please fill in both name and message.');
        return;
    }

    const submitButton = messageForm.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Required for Apps Script simple POST
            },
            body: JSON.stringify({
                action: 'addMessage',
                name: name,
                message: message
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            // Clear form and refresh messages
            nameInput.value = '';
            messageInput.value = '';
            getMessages();
        } else {
            // Show the rejection message from the API
            alert(result.message);
        }

    } catch (error) {
        console.error('Error submitting message:', error);
        alert('Failed to submit message.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});


// Function to handle liking a message
messagesContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('like-button') && !e.target.classList.contains('liked')) {
        const messageId = e.target.dataset.id;
        const likeButton = e.target;
        likeButton.disabled = true; // Prevent multiple clicks

        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({
                    action: 'likeMessage',
                    id: parseInt(messageId)
                })
            });

            // Update UI for instant feedback
            const likeCountSpan = likeButton.nextElementSibling;
            likeCountSpan.textContent = parseInt(likeCountSpan.textContent) + 1;
            likeButton.classList.add('liked');
            likeButton.innerHTML = '❤️ Liked!';


        } catch (error) {
            console.error('Error liking message:', error);
            alert('Failed to like message.');
            likeButton.disabled = false; // Re-enable if it failed
        }
    }
});


// Initial load of messages
getMessages();
