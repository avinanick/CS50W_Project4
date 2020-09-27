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
    let like_count = document.createElement('p');
    let post_info = document.createElement('div');

    display_container.setAttribute('class', "post_display");
    post_info.setAttribute('class', 'post_info');
    poster_link.setAttribute('href', '/user/' + posting_json["poster"]);

    poster_label.innerHTML = posting_json["poster"];
    post_content.innerHTML = posting_json["content"];
    post_timestamp.innerHTML = posting_json["timestamp"];
    like_count.innerHTML = posting_json["likes_count"];

    display_container.appendChild(poster_link);
    display_container.appendChild(post_content);
    display_container.appendChild(post_info);
    poster_link.appendChild(poster_label);
    post_info.appendChild(like_count);
    post_info.appendChild(post_timestamp);

    return display_container;

}

function follow_user() {

    let follow_username = document.querySelector('#profile_username').innerHTML;
    fetch()

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