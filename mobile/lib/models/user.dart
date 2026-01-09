class User {
  final String id;
  final String phone;
  final String? name;
  final String? email;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> addressIds;
  final String? defaultAddressId;

  User({
    required this.id,
    required this.phone,
    this.name,
    this.email,
    required this.createdAt,
    required this.updatedAt,
    this.addressIds = const [],
    this.defaultAddressId,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      phone: json['phone'] ?? '',
      name: json['name'],
      email: json['email'],
      createdAt: json['createdAt'] is DateTime
          ? json['createdAt']
          : DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: json['updatedAt'] is DateTime
          ? json['updatedAt']
          : DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
      addressIds: List<String>.from(json['addressIds'] ?? []),
      defaultAddressId: json['defaultAddressId'],
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'phone': phone,
    'name': name,
    'email': email,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    'addressIds': addressIds,
    'defaultAddressId': defaultAddressId,
  };

  User copyWith({
    String? id,
    String? phone,
    String? name,
    String? email,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<String>? addressIds,
    String? defaultAddressId,
  }) {
    return User(
      id: id ?? this.id,
      phone: phone ?? this.phone,
      name: name ?? this.name,
      email: email ?? this.email,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      addressIds: addressIds ?? this.addressIds,
      defaultAddressId: defaultAddressId ?? this.defaultAddressId,
    );
  }
}
