const streetAlerts = [
  {
    "id": "street_01",
    "street": "rue de Buenos Aires",
    "commune": "Paris 7e",
    "dept": "75",
    "risk": "medium",
    "riskLabel": "À surveiller",
    "precision": "Street named; case still under investigation in source",
    "articles": [
      {
        "date": "2026-05-08",
        "type": "Possible femicide / suspicious death",
        "victim": "Woman, reportedly 28/young adult",
        "summary": "A woman was found dead in a bathtub at her home; public reporting described the case as a possible femicide if confirmed.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/faits-divers/jeune-femme-retrouvee-morte-dans-sa-baignoire-a-paris-celine-etait-quelquun-dexceptionnel-08-05-2026-3LP4IEC36NG23NXO4JFLH2H2C4.php",
        "confidence": "Medium - early reporting"
      }
    ]
  },
  {
    "id": "street_02",
    "street": "rue de l'Egalite",
    "commune": "Les Lilas",
    "dept": "93",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2026-02-23",
        "type": "Femicide by partner",
        "victim": "Christelle, 42",
        "summary": "Killed at home with a hammer and knife; husband/partner arrested, then reportedly detained.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/seine-saint-denis-93/les-lilas-93260/feminicide-aux-lilas-une-femme-tuee-a-coups-de-marteau-et-de-couteau-23-02-2026-OHWUI4DMN5BVHDUOZHWJ545M5U.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_03",
    "street": "avenue Jean-Baptiste-Clement",
    "commune": "Villetaneuse",
    "dept": "93",
    "risk": "medium",
    "riskLabel": "À surveiller",
    "precision": "Street/avenue named",
    "articles": [
      {
        "date": "2025-11-27",
        "type": "Femicide / spouse killing, described with caution",
        "victim": "Therese, 89",
        "summary": "An octogenarian allegedly shot his wife in their apartment before attempting suicide; article discusses whether to call it a 'crime de desespoir' or femicide.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/seine-saint-denis-93/crime-de-desespoir-ou-feminicide-a-villetaneuse-un-octogenaire-tue-son-epouse-et-tente-de-se-suicider-27-11-2025-BLYFM7NJRFGVVCHBUFJMIV3MKM.php",
        "confidence": "High"
      },
      {
        "date": "2019-06-06",
        "type": "Attempted femicide / pregnant woman stabbed",
        "victim": "Pregnant woman, 32",
        "summary": "Pregnant mother stabbed; reporting notes she had previously denounced violence and sought help from neighbours.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/seine-saint-denis-93/villetaneuse-la-mere-enceinte-poignardee-avait-deja-denonce-des-violences-06-06-2019-8088177.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_04",
    "street": "passage des Tourelles",
    "commune": "Paris 20e",
    "dept": "75",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Passage and street named",
    "articles": [
      {
        "date": "2025-09-24",
        "type": "Femicide by husband",
        "victim": "Mina, 60",
        "summary": "A husband called police and said he had killed his wife; she was found dead in/near the passage giving onto rue des Tourelles.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/paris-75/paris-une-femme-tuee-par-son-mari-dans-le-xxe-arrondissement-24-09-2025-3ZHMS6CXUFDD3BHQPYHPB64N6Q.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_05",
    "street": "rue des Tourelles",
    "commune": "Paris 20e",
    "dept": "75",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Passage and street named",
    "articles": [
      {
        "date": "2025-09-24",
        "type": "Femicide by husband",
        "victim": "Mina, 60",
        "summary": "A husband called police and said he had killed his wife; she was found dead in/near the passage giving onto rue des Tourelles.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/paris-75/paris-une-femme-tuee-par-son-mari-dans-le-xxe-arrondissement-24-09-2025-3ZHMS6CXUFDD3BHQPYHPB64N6Q.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_06",
    "street": "avenue Jean-Jaures",
    "commune": "Villetaneuse",
    "dept": "93",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street/avenue named",
    "articles": [
      {
        "date": "2025-07-28",
        "type": "Attempted femicide / shooting",
        "victim": "Woman, seriously wounded",
        "summary": "A woman was shot and hospitalised in serious condition; ex-partner arrested. Reporting mentions a possible motive linked to separation.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/seine-saint-denis-93/villetaneuse-une-femme-grievement-blessee-par-balles-son-ex-conjoint-place-en-garde-a-vue-28-07-2025-BEOLYE2TRJGPJJMQKVN4DXX6YI.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_07",
    "street": "rue Jules-Ferry",
    "commune": "Choisy-le-Roi",
    "dept": "94",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2025-03-01",
        "type": "Femicide / stabbing in street",
        "victim": "Woman, about 60",
        "summary": "Woman stabbed several times in the street; ex-partner pursued for assassination according to later reporting.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/val-de-marne-94/choisy-le-roi-94600/feminicide-de-choisy-le-roi-lancien-conjoint-interpelle-alors-quil-quittait-son-domicile-03-03-2025-QY7JAYU4F5BIPGDVX44DYY4RTA.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_08",
    "street": "rue de Belleville",
    "commune": "Paris 19e",
    "dept": "75",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named; under/near bus shelter",
    "articles": [
      {
        "date": "2025-02-07",
        "type": "Attempted femicide / stabbing",
        "victim": "Woman, 31",
        "summary": "A man stabbed his partner several times under a bus shelter; the victim's prognosis was life-threatening at publication.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/paris-75/paris-une-femme-de-31-ans-entre-la-vie-et-la-mort-apres-une-tentative-de-feminicide-sous-un-abribus-07-02-2025-YDWDQKCOZVC6LMBHIF4XU3CIEY.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_09",
    "street": "avenue Jean-Baptiste-Clement",
    "commune": "Bobigny",
    "dept": "93",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Avenue named in follow-up reporting",
    "articles": [
      {
        "date": "2024-07-19",
        "type": "Femicide / woman found dead with stab wounds",
        "victim": "Romdhana, woman in her 50s",
        "summary": "Woman found dead at home with stab wounds; reporting focuses on prior complaint and search for ex-partner.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/faits-divers/ma-mere-venait-de-deposer-plainte-les-larmes-et-la-colere-du-fils-de-romdhana-tuee-a-bobigny-21-07-2024-ENYOGZ2R5FFFTHRZSYJMJ4EQME.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_10",
    "street": "rue de Torcy",
    "commune": "Paris 18e",
    "dept": "75",
    "risk": "medium",
    "riskLabel": "À surveiller",
    "precision": "Street named",
    "articles": [
      {
        "date": "2023-10-29",
        "type": "Suspected femicide-suicide",
        "victim": "Giuliana B., 37",
        "summary": "Woman and male partner found dead in an apartment; investigators explored femicide followed by suicide.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/faits-divers/paris-le-couple-en-pleine-separation-retrouve-mort-dans-son-appartement-du-xviiie-arrondissement-30-10-2023-SJVUQBRCY5GWVEZVL53IBBVGBA.php",
        "confidence": "Medium - described as investigated piste"
      }
    ]
  },
  {
    "id": "street_11",
    "street": "rue Maurice-Braunstein",
    "commune": "Mantes-la-Jolie",
    "dept": "78",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2022-09-16",
        "type": "Femicide by ex-partner",
        "victim": "Woman, ex-companion",
        "summary": "An SNCF employee suspected of strangling his ex-partner; facts reported in the Gassicourt neighbourhood.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/yvelines-78/feminicide-dans-les-yvelines-un-agent-sncf-soupconne-davoir-etrangle-son-ex-compagne-16-09-2022-YPMMH2JKUFHDBAXBJ5NVCRVC3Y.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_12",
    "street": "rue de Montfort",
    "commune": "Coignieres",
    "dept": "78",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named; residence sociale Adef",
    "articles": [
      {
        "date": "2022-05-03",
        "type": "Femicide by partner",
        "victim": "Liza, 31",
        "summary": "Woman killed in a social residence; partner had reportedly been arrested 13 days earlier for domestic violence.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/yvelines-78/yvelines-un-homme-soupconne-davoir-etrangle-sa-compagne-04-05-2022-HTHZK7OTMJBJPG47CW2JMGCZUU.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_13",
    "street": "rue David-d'Angers",
    "commune": "Paris 19e",
    "dept": "75",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2022-01-28",
        "type": "Femicide by partner; suspect police officer",
        "victim": "Woman born in 1993",
        "summary": "Young woman found dead in a bathtub at her partner's home; partner, a police officer, was later charged after a period on the run.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/paris-75/paris-75019/paris-une-femme-retrouvee-morte-son-compagnon-policier-recherche-29-01-2022-UR5S2YFAGZHVDMXWGWY3AO34QI.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_14",
    "street": "rue du Moutier",
    "commune": "Aubervilliers",
    "dept": "93",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2021-09-11",
        "type": "Femicide by partner",
        "victim": "Wife, mother; age not in snippet",
        "summary": "A man killed his wife with a knife at home; four children present in the apartment were taken into care/hospitalised.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/seine-saint-denis-93/une-femme-egorgee-par-son-conjoint-a-aubervilliers-11-09-2021-2YBICDV4HBCH5OGWZ5I3VSCCCQ.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_15",
    "street": "rue Dulong",
    "commune": "Paris 17e",
    "dept": "75",
    "risk": "medium",
    "riskLabel": "À surveiller",
    "precision": "Street named",
    "articles": [
      {
        "date": "2021-06-14",
        "type": "Suspected femicide-suicide",
        "victim": "Ex-partner; details not in snippet",
        "summary": "A couple was found dead; reporting stated that the man was believed to have killed his ex-partner with a knife before suicide.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/paris-75/paris-un-couple-retrouve-mort-lhomme-aurait-tue-son-ex-compagne-au-couteau-avant-de-suicider-14-06-2021-E7FRTVQ23JGQFJLENAF4VCLJ3M.php",
        "confidence": "Medium"
      }
    ]
  },
  {
    "id": "street_16",
    "street": "38 rue Albert-Thomas",
    "commune": "Champigny-sur-Marne",
    "dept": "94",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Exact street number published",
    "articles": [
      {
        "date": "2020-09-25",
        "type": "Femicide by husband",
        "victim": "Franciele, 29",
        "summary": "Woman killed by multiple knife wounds after a dispute; trial reporting identifies the building address.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/val-de-marne-94/rodrigo-30-ans-juge-aux-assises-pour-le-meurtre-de-sa-femme-tuee-a-coups-de-couteau-a-champigny-sur-marne-11-12-2023-MRRB2VU5EFFGNNYEMBRATSU66Q.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_17",
    "street": "rue Albert-Thuret",
    "commune": "Chevilly-Larue",
    "dept": "94",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2020-08-13",
        "type": "Femicide by husband",
        "victim": "Korotoume, 30",
        "summary": "Woman stabbed by husband after she said she wanted to leave; later trial coverage mentions the street.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/val-de-marne-94/feminicide-un-homme-juge-pour-le-meurtre-de-sa-femme-poignardee-plusieurs-fois-a-chevilly-larue-19-02-2024-QF2O53DBRZCM3K75PGSLL7DC7Q.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_18",
    "street": "rue Pouchet",
    "commune": "Paris 17e",
    "dept": "75",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2020-04-01",
        "type": "Woman killed by stabbing; domestic context not established in snippet",
        "victim": "Woman, 33",
        "summary": "Woman found stabbed and dying in the hall of a building after a call from a local resident. Included as violence against a woman, not confirmed conjugal violence in accessible text.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/paris-75/paris-une-femme-meurt-poignardee-apres-une-soiree-alcoolisee-02-04-2020-8292765.php",
        "confidence": "Medium - not confirmed VAW category beyond victim sex"
      }
    ]
  },
  {
    "id": "street_19",
    "street": "rue de Montval",
    "commune": "Marly-le-Roi",
    "dept": "78",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named; residence named",
    "articles": [
      {
        "date": "2019-10-01",
        "type": "Femicide by ex-partner",
        "victim": "Berthe, 38",
        "summary": "Woman stabbed repeatedly after an ambush by her ex-partner near her workplace.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/yvelines-78/yvelines-une-femme-retrouvee-poignardee-dans-la-rue-a-marly-le-roi-01-10-2019-8163675.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_20",
    "street": "rue du Tour-du-Parc",
    "commune": "Bouqueval",
    "dept": "95",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2019-05-01",
        "type": "Femicide by partner / stabbing",
        "victim": "Sandra, 31",
        "summary": "Woman collapsed on the pavement in front of a house after knife wounds inflicted by her companion.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/val-d-oise-95/val-d-oise-sandra-a-succombe-aux-coups-de-couteau-de-son-compagnon-02-05-2019-8064744.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_21",
    "street": "rue des Campanules",
    "commune": "Gargenville",
    "dept": "78",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2018-10-18",
        "type": "Femicide by husband / beating",
        "victim": "Raouiyah, 39",
        "summary": "Woman died in her house under her husband's blows; later reporting notes detention proceedings.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/faits-divers/yvelines-la-demande-de-remise-en-liberte-du-mari-meurtrier-rejetee-03-10-2019-8165430.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_22",
    "street": "avenue Salvador-Allende, cite de l'Amitie",
    "commune": "Montreuil",
    "dept": "93",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Avenue and housing estate named",
    "articles": [
      {
        "date": "2017-12-30",
        "type": "Femicide by husband / defenestration, with later trial for stabbing",
        "victim": "Woman, 32",
        "summary": "Woman died after falling from the fourth floor; husband placed in custody. Later trial reporting alleged stabbing and defenestration.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/faits-divers/montreuil-poussee-dans-le-vide-par-son-mari-30-12-2017-7476990.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_23",
    "street": "rue du Square-Delambre",
    "commune": "Paris 14e",
    "dept": "75",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named",
    "articles": [
      {
        "date": "2017-07-27",
        "type": "Femicide by partner / beating",
        "victim": "Yasmina, 37",
        "summary": "Woman beaten to death by partner; body later found in a bin/cellar area of the building.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/paris-75/battue-a-mort-et-jetee-dans-une-poubelle-a-paris-la-descente-aux-enfers-de-yasmina-37-ans-25-03-2021-8429899.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_24",
    "street": "rue Gabriel-Peri",
    "commune": "Le Kremlin-Bicetre",
    "dept": "94",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named; 11th floor",
    "articles": [
      {
        "date": "2017-05-21",
        "type": "Attempted femicide / attempted murder of partner",
        "victim": "Female partner; child present context",
        "summary": "Man later sentenced for attempting to kill his partner in an apartment; daughter was aged 8 at the time.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/val-de-marne-94/val-de-marne-sept-ans-de-prison-pour-avoir-tente-de-tuer-sa-compagne-05-02-2021-8423307.php",
        "confidence": "High"
      }
    ]
  },
  {
    "id": "street_25",
    "street": "rue Jean-Louis",
    "commune": "Gentilly",
    "dept": "94",
    "risk": "high",
    "riskLabel": "Risque élevé",
    "precision": "Street named; building hall",
    "articles": [
      {
        "date": "2012-01-20",
        "type": "Femicide by ex-partner / beating with iron bar",
        "victim": "Woman attacked in building hall",
        "summary": "Woman was attacked in the hall of her building and died shortly after; later court reporting described the ex-partner using an iron bar.",
        "source": "Le Parisien",
        "url": "https://www.leparisien.fr/val-de-marne-94/gentilly-94250/gentilly-il-avait-assassine-son-ex-compagne-a-coups-de-barre-de-fer-31-08-2016-6083463.php",
        "confidence": "High"
      }
    ]
  }
];

window.streetAlerts = streetAlerts;