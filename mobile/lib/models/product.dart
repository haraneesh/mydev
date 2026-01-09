class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String category;
  final String subcategory;
  final String imageUrl;
  final int minOrderQuantity;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.subcategory,
    required this.imageUrl,
    this.minOrderQuantity = 1,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? json['type'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 
             (json['unitprice'] as num?)?.toDouble() ?? 0.0,
      category: json['category'] ?? '',
      subcategory: json['subcategory'] ?? json['type'] ?? '',
      imageUrl: json['imageUrl'] ?? json['image'] ?? json['image_path'] ?? '',
      minOrderQuantity: json['minOrderQuantity'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'description': description,
    'price': price,
    'category': category,
    'subcategory': subcategory,
    'imageUrl': imageUrl,
    'minOrderQuantity': minOrderQuantity,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Product &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  double get subtotal => product.price * quantity;

  Map<String, dynamic> toJson() => {
    'productId': product.id,
    'quantity': quantity,
  };

  factory CartItem.fromJson(Map<String, dynamic> json) {
    throw UnimplementedError(
      'CartItem.fromJson requires Product object - use CartItem constructor directly',
    );
  }
}

class Order {
  final String id;
  final List<CartItem> items;
  final double totalAmount;
  final String status;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.items,
    required this.totalAmount,
    this.status = 'placed',
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'] ?? json['id'] ?? '',
      items: [],
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'placed',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'items': items.map((i) => i.toJson()).toList(),
    'totalAmount': totalAmount,
    'status': status,
    'createdAt': createdAt.toIso8601String(),
  };
}
