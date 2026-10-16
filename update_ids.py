import json

real_ids = {
  "_WAC8960.JPG": "1GASazuXgwNl_eNrNAMwVS2ijVI75QCgk",
  "_WAC8958.JPG": "1VgDxFyo-PSbKaXmbTKC6SnTawJTlk6ks",
  "_WAC8957.JPG": "1Nr6kXYtFN8nRj1cW2Nj6OuLGSj5GV6OB",
  "_WAC8956.JPG": "1dLr6wdINSkDi40XS88Vft8TR91UvCyR_",
  "_WAC8955.JPG": "17aN0hEpDRf_zUDD0ah2KmCysBy8ofvwJ",
  "_WAC8954.JPG": "13WRjVLGBaBd8lzENXhedEdEhO2wH5AyR",
  "_WAC8953.JPG": "1G55FB_KX2gGmdTo0w7wfhzDkqNSs82A0",
  "_WAC8952.JPG": "1YUhfVqayjUZ_ta4C-asz4C2YetI5WtBw",
  "_WAC8951.JPG": "1A9qLKDo4VrOmtfeFFJ_K6ve9VjwMXiN8",
  "_WAC8950.JPG": "1NakzSAa_GdI8qIOgL8CsTfQDLtCXhapH"
}

with open("images/images_id.json", "w") as f:
    json.dump(real_ids, f, indent=2)

print("Updated images/images_id.json")
