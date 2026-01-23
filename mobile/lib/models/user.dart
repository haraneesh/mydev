class User {
  final String id;
  final String phone;
  final String? mobile;  // Alias for phone compatibility
  final String? name;
  final String? email;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> addressIds;
  final String? defaultAddressId;
  
  // Profile fields
  final String? salutation;
  final String? firstName;
  final String? lastName;
  final String? whMobilePhone;
  final String? deliveryAddress;
  final String? deliveryPincode;
  
  // Preference fields
  final String? dietaryPreference;
  final String? packingPreference;
  final String? productUpdatePreference;
  final bool clearCartAfterOrder;

  User({
    required this.id,
    required this.phone,
    this.mobile,
    this.name,
    this.email,
    required this.createdAt,
    required this.updatedAt,
    this.addressIds = const [],
    this.defaultAddressId,
    this.salutation,
    this.firstName,
    this.lastName,
    this.whMobilePhone,
    this.deliveryAddress,
    this.deliveryPincode,
    this.dietaryPreference,
    this.packingPreference,
    this.productUpdatePreference,
    this.clearCartAfterOrder = true,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] as Map<String, dynamic>? ?? {};
    final settings = json['settings'] as Map<String, dynamic>? ?? {};
    
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      phone: json['phone'] ?? '',
      mobile: json['mobile'] ?? json['phone'],
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
      salutation: profile['salutation'],
      firstName: profile['name'] is Map ? profile['name']['first'] : null,
      lastName: profile['name'] is Map ? profile['name']['last'] : null,
      whMobilePhone: profile['whMobilePhone'],
      deliveryAddress: profile['deliveryAddress'],
      deliveryPincode: profile['deliveryPincode'],
      dietaryPreference: settings['dietPreference'],
      packingPreference: settings['packingPreference'],
      productUpdatePreference: settings['productUpdatePreference'],
      clearCartAfterOrder: settings['clearCartAfterOrder'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'phone': phone,
    'mobile': mobile,
    'name': name,
    'email': email,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    'addressIds': addressIds,
    'defaultAddressId': defaultAddressId,
    'profile': {
      'salutation': salutation,
      'name': {
        'first': firstName,
        'last': lastName,
      },
      'whMobilePhone': whMobilePhone,
      'deliveryAddress': deliveryAddress,
      'deliveryPincode': deliveryPincode,
    },
    'settings': {
      'dietPreference': dietaryPreference,
      'packingPreference': packingPreference,
      'productUpdatePreference': productUpdatePreference,
      'clearCartAfterOrder': clearCartAfterOrder,
    },
  };

  User copyWith({
    String? id,
    String? phone,
    String? mobile,
    String? name,
    String? email,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<String>? addressIds,
    String? defaultAddressId,
    String? salutation,
    String? firstName,
    String? lastName,
    String? whMobilePhone,
    String? deliveryAddress,
    String? deliveryPincode,
    String? dietaryPreference,
    String? packingPreference,
    String? productUpdatePreference,
    bool? clearCartAfterOrder,
  }) {
    return User(
      id: id ?? this.id,
      phone: phone ?? this.phone,
      mobile: mobile ?? this.mobile,
      name: name ?? this.name,
      email: email ?? this.email,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      addressIds: addressIds ?? this.addressIds,
      defaultAddressId: defaultAddressId ?? this.defaultAddressId,
      salutation: salutation ?? this.salutation,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      whMobilePhone: whMobilePhone ?? this.whMobilePhone,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      deliveryPincode: deliveryPincode ?? this.deliveryPincode,
      dietaryPreference: dietaryPreference ?? this.dietaryPreference,
      packingPreference: packingPreference ?? this.packingPreference,
      productUpdatePreference: productUpdatePreference ?? this.productUpdatePreference,
      clearCartAfterOrder: clearCartAfterOrder ?? this.clearCartAfterOrder,
    );
  }
}
