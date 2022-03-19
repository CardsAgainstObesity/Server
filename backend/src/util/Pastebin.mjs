const fetch = import("node-fetch");
const FormData = import("form-data");


const base = "https://pastebin.com/"
const post = base + "api/api_post.php";
const get = base + "raw/";

/**
 * Creates a new paste and returns the link
 * @param {string} content Pastebin content
 * @param {object} options[]
 * @param {string} options[].title Name/title of the paste
 * @param {number} options[].private This makes a paste public, unlisted or private, public = 0, unlisted = 1, private = 2
 * @returns {Promise<string>} The PasteBin link 
 */
export function createPasteBin (content, options) {

    return new Promise((resolve,reject) => {
        const formData = new FormData();
        formData.append("api_dev_key",process.env.API_DEV_KEY);
        formData.append("api_paste_code",content);
        formData.append("api_paste_private",options.private || 1);
        formData.append("api_paste_name",options.title || "");
        formData.append("api_option","paste");
        
        fetch(post, {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(resolve);
    });
};

/**
 * Given a valid paste key, gets it's raw data
 * @param {string} pasteKey This is paste key you want to fetch the data from
 * @returns {Promise<string>} The raw data from the paste
 */
export function readPasteBin(pasteKey) {

    return new Promise((resolve,reject)=> {
        const rawDataURL = get + pasteKey;
        fetch(rawDataURL)
        .then(res => res.text())
        .then(resolve)
    });
};