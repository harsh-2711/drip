## Overall guidelines
-- price, brand, etc. level filtering to be done at PG level and not vector db --
-- Try to show products from different brands always, shuffle if required --

## Need to update these APIs -
1. /api/stylist/persona
	Input will be base64 image url. We need to pass it to AI to return the following attributes of the user -
	a. skin tone
	b. under tone
	c. gender
	d. body shape

	Use the following metrics to categorise them. Values from the below metrics only should be provided in the output strictly -
	skin tone:
	- Light/Fair
	- Medium
	- Olive
	- Deep/Dark

	undertone:
	- Warm
	- Cool
	- Neutral

	gender:
	- Male
	- Female

	Body Shapes:
	Male -
	Body Shape	Description
	Ectomorph	Slender build, narrow shoulders and hips, fast metabolism, difficult to gain muscle or fat.
	Mesomorph	Athletic and muscular build, broad shoulders, narrow waist, efficient metabolism.
	Endomorph	Rounder physique, gains fat easily, stores fat in lower belly and hips.
	Rectangle	Shoulders and hips are similar in width; balanced proportions.
	Athletic	Muscular body without excessive curves, well-defined musculature.
	Oval	Fuller midsection with narrower shoulders and hips.

	Female -
	Body Shape	Description
	Pear/Triangle	Narrow shoulders, wide hips; weight distributed to lower body (hips and thighs).
	Inverted Triangle/Apple	Broad shoulders, narrow hips; weight concentrated in upper body and stomach.
	Rectangle/Banana	Equal width of shoulders, waist, and hips; minimal curves.
	Hourglass	Balanced bust and hip measurements with a defined narrow waist.
	Spoon	Wider hips than bust with a clearly defined waist; "shelf-like" hips.
	Diamond	Broader hips than shoulders, fuller waistline; slender arms.
	Oval/Apple	Fuller torso with lean limbs; weight concentrated around the midsection.

	response of the api will be userPersona -
	a. skin tone
	b. under tone
	c. gender
	d. body shape
	e. best fits
	f. best colors
	g. ideal size - for both tops, bottoms in standard metric like L, M, S, XL, etc. without considering type of cloth i.e. oversized, tight, etc. -- completely dependent on user image

	use the below metric to get the best fits list -
	Male -
	Body Shape	Suitable Fits	Reasoning
	Ectomorph	Slim Fit, Tailored Fit, Athletic Fit	Accentuates the slender build without overwhelming the frame. Enhances muscle definition.
	Mesomorph	Athletic Fit, Tailored Fit, Compression Fit	Highlights the muscular build while allowing ease of movement and emphasizing muscle definition.
	Endomorph	Relaxed Fit, Regular Fit, Oversized Fit	Provides comfort and minimizes emphasis on wider midsections.
	Rectangle	Tailored Fit, Slim Fit, Regular Fit	Creates a balanced silhouette by adding shape to the shoulders and waist.
	Athletic	Compression Fit, Athletic Fit, Tailored Fit	Enhances definition of muscles while maintaining functionality.
	Oval	Regular Fit, Relaxed Fit, Slim Fit	Offers a clean, polished look without clinging to the midsection.

	Female -
	Body Shape	Suitable Fits	Reasoning
	Pear/Triangle	Flowy Fit, A-Line (not listed), Regular Fit	Balances proportions by drawing attention away from wider hips.
	Inverted Triangle/Apple	Draped Fit, Tailored Fit, Relaxed Fit	Softens broad shoulders and adds volume to the lower body for balance.
	Rectangle/Banana	Form-Fitting, Tailored Fit, Slim Fit	Adds curves and definition to a straight frame.
	Hourglass	Bodycon Fit, Form-Fitting, Tailored Fit	Emphasizes curves and highlights a defined waistline.
	Spoon	Curvy Fit, Plus Size Fit, Relaxed Fit	Enhances natural curves while maintaining comfort around wider hips.
	Diamond	Petite Fit, Tailored Fit, Regular Fit	Streamlines the frame and avoids adding bulk to broader hips or midsection.
	Oval/Apple	Plus Size Fit, Relaxed Fit, Regular Fit	Provides structure and comfort, focusing on flattering the midsection.

	use the below metric to get the best colors list -
	Skin Tone	Undertone	Best Clothing Colors
	Light/Fair	Warm	Earthy tones like peach, coral, gold, warm beige, and orange-based reds.
	Light/Fair	Cool	Cool shades like icy blues, lavender, pink, jewel tones (emerald, sapphire).
	Light/Fair	Neutral	Soft pastels and neutral tones like cream, taupe, or muted greens.
	Medium	Warm	Rich colors like mustard yellow, olive green, warm browns, and burnt orange.
	Medium	Cool	Deep cool colors like navy blue, purple, magenta, and cool greys.
	Medium	Neutral	Balanced shades like teal, dusty rose, or soft browns.
	Olive	Warm	Vibrant shades like golds, oranges, and terracotta.
	Olive	Cool	Jewel tones such as turquoise, emerald green, and royal blue.
	Olive	Neutral	Versatile colors like beige, cream, and muted greens.
	Deep/Dark	Warm	Bold colors like red-orange, golden yellow, and copper.
	Deep/Dark	Cool	Bright cool tones like cobalt blue, fuchsia, and silver.
	Deep/Dark	Neutral	Neutral classics like ivory, charcoal grey, and olive green.

2. /api/stylist/recommendations
	Input will be userPersona as created above and some extra filters -
	1. category - includes both main and sub categories -- example is type of clothing i.e. tops, bottoms, pants, shirts, etc.
	2. loved colors - extra colors apart from user persona's best colors
	3. loved fits - extra fits apart from user persona's fits
	4. dislike tags - attributes of clothing that user dislikes -- need to filter the results coming from vector db based on this criteria -- can create a negation query as well if possible - format will be clothing_type:value, example jeans:skinny, shirt:full-sleeves
	5. user prompt - string value of user ask in natural language -- needs to be processed by AI to modify the above filters before querying the db

	Output should be -
	Products matching the above filters

3. /api/feedback/refine
	Input will be user feedback in natural language and product id for which the feedback is given

	Output -
	dislike tags array which contains attributes of clothing that the user dislikes in the format clothing_type:value, example jeans:skinny, shirt:full-sleeves

4. /api/fit/advice
	Input will be user persona along with product id

	consider user's ideal size and body type from persona and product's body_type_insights from db data. provide this to AI to get an ideal fit based on product type - all attributes like fit, cut, etc.

	Output -
	recommended size - L,XL, etc.
	fittingAdvice - advice from AI in max 2 short sentence on why this size

5. /api/visual/outfit
	Input will be user's image in base64

	Use the user's image and product image (can use the first image in image_urls list) and then ask gpt-4o to keep the user subject as it is and just replace the clothes of the user with the other image provided. AI need to remove the existing clothes and replace it with new clothes and provide the final image.

	Output -
	image - base64 format


## Need to remove these APIs -
1. /api/feedback/response
2. /api/fit/extract-measurements
