document.addEventListener('DOMContentLoaded', function() {

    // Here we should determine what page we are on, and load accordingly
    // May change this to getting a class, then checking its id in the if
    const posts_list = document.querySelector('.post_list')
    if (posts_list.id === "all_posts") {
        // set the listeners for the all posts section
        load_page_posts("all", 1);
        document.getElementById('new_post_form').addEventListener('submit', create_new_post);
    }
    if(posts_list.id === 'subscription_posts') {
        load_page_posts("subscription", 1);
    }
    if(posts_list.id === 'user_posts') {
        load_page_posts(posts_list.dataset.user, 1);
        const follow_button = document.querySelector('#follow_button');
        if(follow_button) {
            follow_button.addEventListener('click', follow_user);
        }
    }
    
  });

function cancel_edit(event, old_text, post_id) {

    let cancel_button = event.target;
    let edit_content = cancel_button.parentNode.parentNode.parentNode.childNodes[1];

    let post_content = document.createElement('p');

    post_content.innerHTML = old_text;

    let edit_button = document.createElement('button');
    edit_button.innerHTML = "Edit";
    edit_button.setAttribute('class', 'btn btn-outline-primary btn-small');
    edit_button.addEventListener('click', function(event) { 
        edit_post(event, post_id) 
    });

    cancel_button.parentNode.parentNode.replaceChild(edit_button, cancel_button.parentNode);
    edit_content.parentNode.replaceChild(post_content, edit_content);

}

function create_new_post(event) {

    event.preventDefault()

    let post_content = document.getElementById('new_post_content').value;
    const csrftoken = getCookie('csrftoken');

    fetch('/create', {
        headers: {'X-CSRFToken': csrftoken},
        method: 'POST',
        body: JSON.stringify({
            content: post_content
        })
      })
      .then(response => {
          console.log(response);
          document.getElementById('new_post_content').value = "";
          // Should I reload the pages? Do some animation?
          load_page_posts("all", 1);
      })

}

function create_posting_element(posting_json) {

    // The pistong json should have: the poster name, the content, the number of
    // likes, if the current user has liked the post or not, the timestamp, and
    // whether or not the user owns this post
    let display_container = document.createElement('div');
    let poster_link = document.createElement('a');
    let poster_label = document.createElement('h4');
    let post_content = document.createElement('p');
    let post_timestamp = document.createElement('p');
    let like_count = document.createElement('button');
    let post_info = document.createElement('div');

    display_container.setAttribute('class', "post_display");
    post_info.setAttribute('class', 'post_info');
    poster_link.setAttribute('href', '/user/' + posting_json["poster"]);
    like_count.setAttribute('class', 'btn btn-small');
    like_count.addEventListener('click', function(event) {
        toggle_like(event, posting_json["id"])
    });

    poster_label.innerHTML = posting_json["poster"];
    post_content.innerHTML = posting_json["content"];
    post_timestamp.innerHTML = posting_json["timestamp"];
    like_count.innerHTML = "Likes: " + posting_json["likes_count"];

    display_container.appendChild(poster_link);
    display_container.appendChild(post_content);
    display_container.appendChild(post_info);
    poster_link.appendChild(poster_label);
    post_info.appendChild(like_count);
    post_info.appendChild(post_timestamp);

    if(posting_json["from_user"]) {
        // add an edit button/link with a listener and data attribute for editing
        let edit_button = document.createElement('button');
        edit_button.innerHTML = "Edit";
        edit_button.setAttribute('class', 'btn btn-outline-primary btn-small');
        edit_button.addEventListener('click', function(event) { 
            edit_post(event, posting_json["id"]) 
        });
        post_info.appendChild(edit_button);
    }

    return display_container;

}

function edit_post(event, post_id) {

    let edit_button = event.target;
    let content = edit_button.parentNode.parentNode.childNodes[1];

    let edit_post_section = document.createElement('div');
    let edit_post_text = document.createElement('textarea');
    let edit_post_buttons = document.createElement('div');
    let edit_post_confirm = document.createElement('button');
    let edit_post_cancel = document.createElement('button');

    edit_post_cancel.innerHTML = "Cancel";
    edit_post_confirm.innerHTML = "Submit";
    edit_post_text.value = content.innerHTML;

    edit_post_confirm.addEventListener('click', function(event) {
        submit_edit(event, post_id)
    });
    edit_post_cancel.addEventListener('click', function(event) {
        cancel_edit(event, content.innerHTML, post_id)
    });

    edit_post_buttons.appendChild(edit_post_confirm);
    edit_post_buttons.appendChild(edit_post_cancel);

    edit_button.parentNode.replaceChild(edit_post_buttons, edit_button);
    content.parentNode.replaceChild(edit_post_text, content);

}

function follow_user() {

    let follow_username = document.querySelector('#profile_username').innerHTML;
    const csrftoken = getCookie('csrftoken');
    const follow_button = document.querySelector('#follow_button');
    let add_follow = (follow_button.innerHTML.trim() === "Follow");
    console.log(add_follow)

    fetch('follow', {
        headers: {'X-CSRFToken': csrftoken},
        method: 'PUT',
        body: JSON.stringify({
            name: follow_username,
            follow: add_follow
        })
    })
    .then(response => {
        console.log(response);
        if(add_follow) {
            follow_button.innerHTML = 'Unfollow';
            // perhaps add some functionality to display the new follow count
        }
        else {
            follow_button.innerHTML = 'Follow';
        }
    })

}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function get_num_post_pages(user_set) {

}

function load_page_posts(user_set, page_number) {

    fetch('/posts/' + user_set + '/' + page_number)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        // Remove old list
        let current_posts = document.querySelectorAll(".post_display");
        for(var post of current_posts) {
            post.remove()
        }
        // Get the posts list and add them all using create post element
        // Keep in mind the last element in the object is the number of pages
        let post_list = document.querySelector(".post_list");
        for(let i = 0; i < posts[0].length; i++) {
            post_list.appendChild(create_posting_element(posts[0][i]));
        }
    })

}

function submit_edit(event, post_id) {

    let submit_button = event.target;
    let edit_content = submit_button.parentNode.parentNode.parentNode.childNodes[1];

    const csrftoken = getCookie('csrftoken');

    fetch('update_post', { // I'm certain this will cause issues on the profile page
        headers: {'X-CSRFToken': csrftoken},
        method: 'PUT',
        body: JSON.stringify({
            content: edit_content.value,
            id: post_id
        })
    })
    .then(response => {

        let post_content = document.createElement('p');

        post_content.innerHTML = edit_content.value;

        let edit_button = document.createElement('button');
        edit_button.innerHTML = "Edit";
        edit_button.setAttribute('class', 'btn btn-outline-primary btn-small');
        edit_button.addEventListener('click', function(event) { 
            edit_post(event, posting_json["id"]) 
        });

        submit_button.parentNode.parentNode.replaceChild(edit_button, submit_button.parentNode);
        edit_content.parentNode.replaceChild(post_content, edit_content);

    })

}

function toggle_like(event, post_id) {

    let like_button = event.target;

    const csrftoken = getCookie('csrftoken');

    fetch('toggle_like', { // I'm certain this will cause issues on the profile page
        headers: {'X-CSRFToken': csrftoken},
        method: 'PUT',
        body: JSON.stringify({
            id: post_id
        })
    })
    .then(response => response.json())
    .then(update => {
        like_button.innerHTML = "Likes: " + update["likes_count"];
    })

}