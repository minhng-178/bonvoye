import 'city.dart';

class Country {
  final String id;
  final String name;
  final String description;
  final List<City> cities;

  Country({
    required this.id,
    required this.name,
    required this.description,
    required this.cities,
  });

  factory Country.fromJson(Map<String, dynamic> json) {
    var cityList = json['cities'] as List? ?? [];
    List<City> cityObjects = cityList
        .map((c) => City.fromJson(c as Map<String, dynamic>))
        .toList();

    return Country(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      cities: cityObjects,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'cities': cities.map((c) => c.toJson()).toList(),
    };
  }
}
