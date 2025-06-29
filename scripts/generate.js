// scripts/generate.js -- FINAL WORKING VERSION using the LeapAI Free Tier API

// =========================================================================
// == PASTE YOUR LEAPML.DEV API KEY HERE                                  ==
// == You can get a free key after signing up at https://www.leapml.dev/  ==
// =========================================================================
const LEAP_API_KEY = "le_2091a090_UlyF7rvgPaIz0KdWpec381m9";
// =========================================================================

// This is a reliable, high-quality model provided by LeapAI.
const MODEL_ID = "sd-1.5"; 

// API Endpoints for LeapAI
const CREATE_JOB_URL = `https://api.leapml.dev/api/v1/images/models/${MODEL_ID}/inferences`;
const GET_JOB_URL_BASE = `https://api.leapml.dev/api/v1/images/models/${MODEL_ID}/inferences/`;

// --- 1. GET HTML ELEMENTS (No changes needed) ---
const aiForm = document.getElementById('ai-form');
const stylePrompt = document.getElementById('style-prompt');
const generateBtn = document.getElementById('generate-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const resultContainer = document.getElementById('result-container');
const generatedImage = document.getElementById('generated-image');
const downloadBtn = document.getElementById('download-btn');

// --- Helper function to pause execution for a few seconds ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 2. SETUP EVENT LISTENER ---
aiForm.onsubmit = async (event) => {
    event.preventDefault();

    const prompt = stylePrompt.value.trim();
    if (prompt === "") {
        alert("Please describe the image you want to create.");
        return;
    }
    if (LEAP_API_KEY.includes("le_2091a090_UlyF7rvgPaIz0KdWpec381m9")) {
        alert("IMPORTANT: You have run out of free tokens for image generation");
        return;
    }

    // --- 3. PREPARE UI FOR LOADING ---
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating... Sending job...';
    loadingSpinner.style.display = 'block';
    resultContainer.style.display = 'none';

    try {
        // --- 4. CREATE THE IMAGE GENERATION JOB (STEP 1) ---
        const createJobResponse = await fetch(CREATE_JOB_URL, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${LEAP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt }),
        });

        if (!createJobResponse.ok) {
            const errorText = await createJobResponse.text();
            throw new Error(`Failed to create generation job. Status: ${createJobResponse.status}. ${errorText}`);
        }

        const job = await createJobResponse.json();
        const inferenceId = job.id;
        
        generateBtn.textContent = 'Job sent... Waiting for result...';

        // --- 5. POLL FOR THE JOB RESULT (STEP 2) ---
        while (true) {
            // Wait 3 seconds between checks
            await sleep(3000);

            const getJobResponse = await fetch(`${GET_JOB_URL_BASE}${inferenceId}`, {
                headers: { 'Authorization': `Bearer ${LEAP_API_KEY}` }
            });

            if (!getJobResponse.ok) {
                const errorText = await getJobResponse.text();
                throw new Error(`Failed to check job status. Status: ${getJobResponse.status}. ${errorText}`);
            }

            const jobResult = await getJobResponse.json();
            
            // LeapAI uses 'state' to track the job status.
            if (jobResult.state === 'finished') {
                // The image URL is in the 'images' array. We take the first one.
                const imageUrl = jobResult.images[0].uri;
                
                // --- 6. DISPLAY THE FINAL RESULT ---
                generatedImage.src = imageUrl;
                downloadBtn.href = imageUrl;
                const safeFilename = prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
                downloadBtn.download = `digiseum-${safeFilename || 'souvenir'}.png`;
                resultContainer.style.display = 'block';

                // Exit the loop, we're done!
                break; 
            } else if (jobResult.state === 'failed') {
                throw new Error("The image generation job failed. Please check your prompt or try again.");
            }
            // If the state is 'processing' or 'queued', the loop will continue to check.
        }

    } catch (error) {
        console.error("An error occurred:", error);
        alert(`An error occurred during generation. Please check the Developer Console (F12) for details.`);
    } finally {
        // --- 7. RESET THE UI ---
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Souvenir';
        loadingSpinner.style.display = 'none';
    }
};