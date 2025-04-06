
1. /api/stylist/persona
	Input will be base64 image url of the person's image provided on the onboarding stage.

	response of the api will be userPersona -
	a. skin tone
	b. under tone
	c. gender
	d. body shape
	e. best fits
	f. best colors
	g. ideal size - for both tops, bottoms in standard metric like L, M, S, XL, etc. without considering type of cloth i.e. oversized, tight, etc. -- completely dependent on user image

	we need to store this locally to know the userPersona. This will get updates as well as per user's feedback.

2. /api/stylist/recommendations
	Input will be userPersona as created above and some extra filters -
	1. category - includes both main and sub categories -- example is type of clothing i.e. tops, bottoms, pants, shirts, etc. -- this will be used from the "Explore" tab where user will pick a category.
	2. loved colors - extra colors apart from user persona's best colors -- colors for which user adds a cloth to trial. This colors will be exclusive of user's persona best colors. Also, if user adds items of a particular color more than 5 times, then only add it to this list. And if user dislikes this color for 5 times, then remove it from the list.
	3. loved fits - extra fits apart from user persona's fits -- same logic as loved colors but on fits
	4. dislike tags - attributes of clothing that user dislikes -- these tags will be provided as the response of `/api/feedback/refine` and we need to store it at user level and then pass it if populated - format will be clothing_type:value, example jeans:skinny, shirt:full-sleeves
	5. user prompt - string value of user ask in natural language -- needs to be processed by AI to modify the above filters before querying the db -- this will be used from the "Search" tab. So, ideally, either of `category` or `user prompt` will be provided in each request

	Output will be -
	Products matching the above filters

3. /api/feedback/refine
	Input will be user feedback in natural language and product id for which the feedback is given

	This needs to be called when user submits a feedback for a particular item by clicking on "Leave a comment" under the cards.

	Output will be tags which needs to be stored in dislike_tags under user's model

	Output -
	dislike tags array which contains attributes of clothing that the user dislikes in the format clothing_type:value, example jeans:skinny, shirt:full-sleeves

4. /api/fit/advice
	Input will be user persona along with product id

	this will be called to get the ideal size of the product for the user on the Trial Room View page. This size will be shown upfront as recommended with a "i" tag clicking on which will provide a tooltip with fittingAdvice available in response.

	Output -
	recommended size - L,XL, etc.
	fittingAdvice - advice from AI in max 2 short sentence on why this size

5. /api/visual/outfit
	Input will be user's image in base64 and productId

	Use the user's image stored initially from onboarding view.
	Output image needs to be rendered in the trail room view. This API will be sensitive as user will send an image to Trial view from the main cards view page. On sending the image to Trial, we should call this API to start the processing in background. Once, we receive the response, we should store this image and when user goes to trial room, we can render it. So, background processing is required here. Handle it efficiently and elegantly.

	Output -
	image - base64 format
