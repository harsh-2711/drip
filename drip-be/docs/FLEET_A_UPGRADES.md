## Agent A -
1. not required for now -- so keep all the logic ang generation scripts but remove it from the npm run start logic

## Agent B -
1. there should be two ways to get the data -
	a. scraping from websites -- already in place
	b. using the shopify api -- need to add support
		- assume a list of Shopify APIs that will return json response in the format -
		```
		{
			"products": [
				{
					"id": 7434884546634,
					"title": "Camila Midi Dress",
					"handle": "camila-midi-dress",
					"body_html": null,
					"published_at": "2025-02-19T10:25:19-08:00",
					"created_at": "2023-12-29T12:27:39-08:00",
					"updated_at": "2025-04-04T11:51:21-07:00",
					"vendor": "Marine Layer",
					"product_type": "Womens - Dresses - All",
					"tags": [
						"cf-size-extra-large",
						"cf-size-extra-small",
						"cf-size-large",
						"cf-size-medium",
						"cf-size-small",
						"dresses",
						"ebd",
						"fall2024sale",
						"filter_maximidi",
						"filter_shortsleeve",
						"gals",
						"getawaysale",
						"maxidress",
						"spo-cs-disabled",
						"spo-default",
						"spo-disabled",
						"spo-notify-me-disabled",
						"sun dress",
						"sundress",
						"YGroup_camila_midi_dress"
					],
					"variants": [
						{
							"id": 40628965507146,
							"title": "Extra Small \/ Black",
							"option1": "Extra Small",
							"option2": "Black",
							"option3": null,
							"sku": "1240206001096-01",
							"requires_shipping": true,
							"taxable": true,
							"featured_image": null,
							"available": true,
							"price": "148.00",
							"grams": 454,
							"compare_at_price": "148.00",
							"position": 1,
							"product_id": 7434884546634,
							"created_at": "2023-12-29T12:27:39-08:00",
							"updated_at": "2025-04-04T11:51:21-07:00"
						},
						{
							"id": 40628965539914,
							"title": "Small \/ Black",
							"option1": "Small",
							"option2": "Black",
							"option3": null,
							"sku": "1240206001096-02",
							"requires_shipping": true,
							"taxable": true,
							"featured_image": null,
							"available": true,
							"price": "148.00",
							"grams": 454,
							"compare_at_price": "148.00",
							"position": 2,
							"product_id": 7434884546634,
							"created_at": "2023-12-29T12:27:39-08:00",
							"updated_at": "2025-04-04T11:51:21-07:00"
						},
						{
							"id": 40628965572682,
							"title": "Medium \/ Black",
							"option1": "Medium",
							"option2": "Black",
							"option3": null,
							"sku": "1240206001096-03",
							"requires_shipping": true,
							"taxable": true,
							"featured_image": null,
							"available": true,
							"price": "148.00",
							"grams": 454,
							"compare_at_price": "148.00",
							"position": 3,
							"product_id": 7434884546634,
							"created_at": "2023-12-29T12:27:39-08:00",
							"updated_at": "2025-04-04T11:51:21-07:00"
						},
						{
							"id": 40628965605450,
							"title": "Large \/ Black",
							"option1": "Large",
							"option2": "Black",
							"option3": null,
							"sku": "1240206001096-05",
							"requires_shipping": true,
							"taxable": true,
							"featured_image": null,
							"available": true,
							"price": "148.00",
							"grams": 454,
							"compare_at_price": "148.00",
							"position": 4,
							"product_id": 7434884546634,
							"created_at": "2023-12-29T12:27:39-08:00",
							"updated_at": "2025-04-04T11:51:21-07:00"
						},
						{
							"id": 40628965638218,
							"title": "Extra Large \/ Black",
							"option1": "Extra Large",
							"option2": "Black",
							"option3": null,
							"sku": "1240206001096-07",
							"requires_shipping": true,
							"taxable": true,
							"featured_image": null,
							"available": true,
							"price": "148.00",
							"grams": 454,
							"compare_at_price": "148.00",
							"position": 5,
							"product_id": 7434884546634,
							"created_at": "2023-12-29T12:27:39-08:00",
							"updated_at": "2025-04-04T11:51:21-07:00"
						}
					],
					"images": [
						{
							"id": 33044989345866,
							"created_at": "2025-02-11T11:49:09-08:00",
							"position": 1,
							"updated_at": "2025-02-11T11:49:31-08:00",
							"product_id": 7434884546634,
							"variant_ids": [],
							"src": "https:\/\/cdn.shopify.com\/s\/files\/1\/0831\/9103\/files\/S2_W_17302_Camila_Midi_Dress_Solid_Black-4127-Final-Web.jpg?v=1739303371",
							"width": 2000,
							"height": 2372
						},
						{
							"id": 33044989509706,
							"created_at": "2025-02-11T11:49:10-08:00",
							"position": 2,
							"updated_at": "2025-02-11T11:49:31-08:00",
							"product_id": 7434884546634,
							"variant_ids": [],
							"src": "https:\/\/cdn.shopify.com\/s\/files\/1\/0831\/9103\/files\/S2_W_17302_Camila_Midi_Dress_Solid_Black-4097-Final-Web.jpg?v=1739303371",
							"width": 2000,
							"height": 2372
						},
						{
							"id": 33044989378634,
							"created_at": "2025-02-11T11:49:10-08:00",
							"position": 3,
							"updated_at": "2025-02-11T11:49:31-08:00",
							"product_id": 7434884546634,
							"variant_ids": [],
							"src": "https:\/\/cdn.shopify.com\/s\/files\/1\/0831\/9103\/files\/S2_W_17302_Camila_Midi_Dress_Solid_Black-4121-Final-Web.jpg?v=1739303371",
							"width": 2000,
							"height": 2372
						},
						{
							"id": 33044989411402,
							"created_at": "2025-02-11T11:49:10-08:00",
							"position": 4,
							"updated_at": "2025-02-11T11:49:31-08:00",
							"product_id": 7434884546634,
							"variant_ids": [],
							"src": "https:\/\/cdn.shopify.com\/s\/files\/1\/0831\/9103\/files\/S2_W_17302_Camila_Midi_Dress_Solid_Black-4100-Final-Web.jpg?v=1739303371",
							"width": 2000,
							"height": 2372
						},
						{
							"id": 33044989542474,
							"created_at": "2025-02-11T11:49:09-08:00",
							"position": 5,
							"updated_at": "2025-02-11T11:49:31-08:00",
							"product_id": 7434884546634,
							"variant_ids": [],
							"src": "https:\/\/cdn.shopify.com\/s\/files\/1\/0831\/9103\/files\/S2_W_17302_Camila_Midi_Dress_Solid_Black-4146-Final-Web.jpg?v=1739303371",
							"width": 2000,
							"height": 2372
						},
						{
							"id": 33044989575242,
							"created_at": "2025-02-11T11:49:10-08:00",
							"position": 6,
							"updated_at": "2025-02-11T11:49:12-08:00",
							"product_id": 7434884546634,
							"variant_ids": [],
							"src": "https:\/\/cdn.shopify.com\/s\/files\/1\/0831\/9103\/files\/S2_W_17302_Camila_Midi_Dress_Solid_Black8-Final-Web.jpg?v=1739303352",
							"width": 2000,
							"height": 2372
						}
					],
					"options": [
						{
							"name": "Size",
							"position": 1,
							"values": [
								"Extra Small",
								"Small",
								"Medium",
								"Large",
								"Extra Large"
							]
						},
						{
							"name": "Color",
							"position": 2,
							"values": [
								"Black"
							]
						}
					]
				},
				...
			]
		}
		```
		For this approach, there won't be any product url -- which is fine for now -- there won't be any description field either. So, we need to handle this by creating a dummy description by combining following fields - `product_type`, `tags` and `handle`. Also, use only a single variant to store this item. We can ignore other size variants.
3. parse all possible images and then store them as an array -- mostly all websites contains multiple photos of same product in front shot, back shot, etc.
	a. in case if a product doesn't contain photos, drop the product from further pipelines
4. Fix available sizes property -- assume product contains all available sizes -- so don't populate this

-- filter the products based on wrong descriptions, for now can check on length of description, should be atleast 10 words long --

## Agent C -
1. add more few shots learning examples
2. filter the products with missing primary color
3. create a new field to store category -- tops and bottoms and one-piece --
4. description field is the primary field. Can there be more fields here to better judge the product? Title, Tags
5. No need to get `skin_tone_match` from AI. remove this field from db storage as well.
6. For the metadata to be extracted using AI via prompt, use the following exhaustive list to get suggestions -
```
Style Type:
Casual
Smart Casual
Business Casual
Business Professional
Formal
Semi-Formal
Black Tie
White Tie
Cocktail
Partywear
Clubwear
Athleisure
Activewear
Sportswear
Loungewear
Sleepwear
Streetwear
Workwear
Outerwear
Beachwear
Swimwear
Resort Wear
Traditional / Ethnic Wear
Fusion Wear
Maternity Wear
Unisex

Aesthetic:
Bohemian (Boho)
Vintage
Retro
Gothic
Punk
Grunge
Preppy
Hipster
Chic
Artsy
Minimalist
Maximalist
Avant-Garde
Eclectic
Androgynous
Feminine
Masculine
Modest
Urban (Street)
Hip-Hop
Skate
Surf
Western (Cowboy)
Classic
Elegant
Luxury
Glamorous
Sexy
Kitsch
Camp
Sporty
Futuristic
Cyberpunk
Steampunk
Techwear
Gorpcore
Normcore
Cottagecore
Dark Academia
Light Academia
Emo
Geek Chic
Ethnic (Traditional Inspired)
Folkloric
Tribal Prints
African-Inspired
Victorian
Art Deco (1920s)
Dandy
Military
Utility
Industrial
Biker (Motorcycle)
Y2K (2000s)
90s (1990s Retro)
80s (1980s Retro)
70s (1970s Retro)
60s (Mod Era)
50s (Pin-up/Rockabilly)
Harajuku
Kawaii
Lolita
E-girl / E-boy
K-Pop
Bollywood
Scandinavian Minimalist
French Chic
Italian Classic
Beachy
Tropical
Safari
Nautical
Eco-Friendly (Sustainable)

Fabric:
Cotton
Organic Cotton
Linen
Hemp
Jute
Wool
Merino Wool
Cashmere
Mohair
Silk
Satin
Denim
Leather
Faux Leather (Vegan Leather)
Suede
Fur
Faux Fur
Down (Feather)
Velvet
Velour
Corduroy
Tweed
Flannel
Fleece
Jersey
Knit
Lace
Crochet
Chiffon
Organza
Tulle
Mesh
Canvas
Chambray
Rayon (Viscose)
Modal
Lyocell (Tencel)
Bamboo Fiber
Polyester
Recycled Polyester
Nylon
Acrylic
Spandex (Elastane)
Neoprene
Gore-Tex
Polyurethane
PVC (Vinyl)
Latex
Sequined Fabric
Beaded Fabric
Brocade
Ikat
Batik
Tie-Dye
Handwoven
Hand-knit
Lurex (Metallic)
Silk Blend
Wool Blend
Poly-Cotton Blend

Cut:
A-Line
Sheath
Shift
Fit-and-Flare
Empire Waist
Drop Waist
Mermaid Silhouette
Trumpet Silhouette
Ballgown
Peplum
Wrap Style
Asymmetrical Design
High-Low Hem
Tiered Skirt
Pleated
Draped
Ruched
Cut-Out Details
High Slit
Train
Off-Shoulder
One-Shoulder
Halter Neck
Strapless
Spaghetti Straps
Sweetheart Neckline
V-Neck
Plunging Neckline
Crew Neck
Scoop Neck
Square Neck
Boat Neck
Collared
Turtleneck
Cowl Neck
Keyhole Neckline
Backless
Long Sleeves
Three-Quarter Sleeves
Short Sleeves
Sleeveless
Cap Sleeves
Bell Sleeves
Puff Sleeves
Bishop Sleeves
Balloon Sleeves
Kimono Sleeves
Raglan Sleeves
Dolman Sleeves
Cold-Shoulder Sleeves
Flutter Sleeves
High-Rise Waist
Mid-Rise Waist
Low-Rise Waist
Paperbag Waist
Elastic Waist
Drawstring Waist
Skinny Leg
Tapered Leg
Straight Leg
Wide Leg
Bootcut
Flared Leg
Palazzo Pants
Harem Pants
Cuffed Hem
Jogger Style
Cropped Length
Capri Length
Ankle Length
Knee Length
Tea Length
Floor Length
Mini Length
Midi Length
Maxi Length
Longline
Double-Breasted
Single-Breasted
Hooded
Button-Down Front

Fit Type:
Slim Fit
Regular Fit
Relaxed Fit
Loose Fit
Oversized Fit
Tailored Fit
Boxy Fit
Compression Fit
Skinny Fit
Baggy Fit
Bodycon Fit
Form-Fitting
Draped Fit
Flowy Fit
Athletic Fit
Curvy Fit
Plus Size Fit
Petite Fit
Tall Fit
Maternity Fit
Unisex Fit

Occasion to Wear:
Everyday Wear
Office Wear
Job Interview
Formal Event
Black Tie Event
White Tie Event
Cocktail Party
Wedding (Guest)
Bridal Wear
Bridesmaid
Party / Celebration
Holiday Party
Night Out (Clubbing)
Date Night
Dinner Party
Prom
Graduation
Music Festival
Beach Day
Resort Vacation
Pool Party
Beach Wedding
Gym / Workout
Running / Jogging
Yoga Session
Hiking / Camping
Travel
Lounge at Home
Sleep / Nightwear
Funeral / Memorial
Rainy Weather
Winter (Cold Weather)
Autumn / Fall
Spring
Summer (Hot Weather)
```

	Modify the prompt such that AI strictly provides a value from this lists only. Also, modify few shot examples accordingly.

## Agent D - 
1. add more few shots learning examples
2. for body type insights, use the following body types only and try to populate a value corresponding to them via AI -
```
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
```
Modify few shots examples accordingly.

## Postgres DB -
1. Remove the following fields from the db - sku, pinecone_id
