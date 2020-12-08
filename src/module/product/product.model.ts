import { ObjectId } from "mongodb"

export const ProductsModel = (skip: number, limit: number) => {
  return [
    {
      $facet: {
        products: [
          {
            $match: {
              status: {
                $ne: "CLOSE"
              }
            }
          },
          {
            $project: {
              _id: 0,
              productId: "$_id",
              title: 1,
              slug: 1,
              images: 1,
              price: 1,
              status: 1,
              createdAt: 1
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ],
        totalPages: [
          {
            $match: {
              status: {
                $ne: "CLOSE"
              }
            }
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1
              }
            }
          },
          {
            $project: {
              _id: 0,
              totalPages: {
                $ceil: {
                  $divide: ["$count", limit]
                }
              }
            }
          },
        ]
      }
    }
  ]
}

export const ProductModel = (slug: string) => {
  return [
    {
      $match: {
        slug,
        status: {
          $ne: "CLOSE"
        }
      }
    },
    {
      $lookup: {
        from: "categories",
        let: { categoryId: "$categoryId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$categoryId"]
              }
            }
          },
          {
            $project: {
              title: 1,
              _id: 0
            }
          }
        ],
        as: "category"
      }
    },
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$userId"]
              }
            }
          },
          {
            $project: {
              name: 1,
              avartar: 1,
              _id: 0
            }
          }
        ],
        as: "user"
      }
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        title: 1,
        slug: 1,
        description: 1,
        price: 1,
        images: 1,
        location: 1,
        category: 1,
        user: 1,
        userId: 1,
        status: 1,
        createdAt: 1
      }
    },
    {
      $limit: 1
    }
  ]
}

export const ProductByIdModel = (id: string) => {
  return [
    {
      $match: {
        _id: new ObjectId(id),
        status: {
          $ne: "CLOSE"
        }
      }
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        title: 1,
        description: 1,
        price: 1,
        images: 1,
        location: 1,
        categoryId: 1,
        userId: 1,
        status: 1,
        createdAt: 1
      }
    },
    {
      $limit: 1
    }
  ]
}

export const SearchProductModel = (text: string, skip: number, limit: number) => {
  return [
    {
      $facet: {
        products: [
          {
            $match: {
              title: {
                $regex: text,
                $options: 'i'
              },
              status: {
                $ne: "CLOSE"
              }
            }
          },
          {
            $project: {
              _id: 0,
              productId: "$_id",
              title: 1,
              slug: 1,
              images: 1,
              price: 1,
              status: 1,
              createdAt: 1
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ],
        totalPages: [
          {
            $match: {
              title: {
                $regex: text,
                $options: 'i'
              },
              status: {
                $ne: "CLOSE"
              }
            }
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1
              }
            }
          },
          {
            $project: {
              _id: 0,
              totalPages: {
                $ceil: {
                  $divide: ["$count", limit]
                }
              }
            }
          },
        ]
      }
    }
  ]
}

export const ProductByCategoryModel = (categoryId: string, skip: number, limit: number) => {
  return [
    {
      $facet: {
        products: [
          {
            $match: {
              categoryId: new ObjectId(categoryId),
              status: {
                $ne: "CLOSE"
              }
            }
          },
          {
            $project: {
              _id: 0,
              productId: "$_id",
              title: 1,
              slug: 1,
              images: 1,
              price: 1,
              status: 1,
              createdAt: 1
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ],
        totalPages: [
          {
            $match: {
              categoryId: new ObjectId(categoryId),
              status: {
                $ne: "CLOSE"
              }
            }
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1
              }
            }
          },
          {
            $project: {
              _id: 0,
              totalPages: {
                $ceil: {
                  $divide: ["$count", limit]
                }
              }
            }
          },
        ]
      }
    }
  ]
}

export const ProductByUserIdModel = (userId: string, skip: number, limit: number) => {
  return [
    {
      $facet: {
        products: [
          {
            $match: {
              userId: new ObjectId(userId),
              status: {
                $ne: "CLOSE"
              }
            }
          },
          {
            $project: {
              _id: 0,
              productId: "$_id",
              title: 1,
              slug: 1,
              images: 1,
              price: 1,
              status: 1,
              createdAt: 1
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ],
        totalPages: [
          {
            $match: {
              userId: new ObjectId(userId),
              status: {
                $ne: "CLOSE"
              }
            }
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1
              }
            }
          },
          {
            $project: {
              _id: 0,
              totalPages: {
                $ceil: {
                  $divide: ["$count", limit]
                }
              }
            }
          },
        ]
      }
    }
  ]
}

export const FeatureProductsModel = () => {
  return [
    {
      $match: {
        status: {
          $ne: "CLOSE"
        }
      }
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        title: 1,
        slug: 1,
        images: 1,
        price: 1,
        status: 1,
        createdAt: 1
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $limit: 4
    }
  ]
}