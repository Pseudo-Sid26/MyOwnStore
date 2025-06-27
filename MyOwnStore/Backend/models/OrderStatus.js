const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
  stage: {
    type: String,
    required: [true, 'Stage is required'],
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  order: {
    type: Number,
    required: [true, 'Order is required'],
    unique: true,
    min: [1, 'Order must be at least 1']
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster order lookups
orderStatusSchema.index({ order: 1 });

// Static method to get statuses in order
orderStatusSchema.statics.getOrderedStatuses = function() {
  return this.find().sort({ order: 1 });
};

// Static method to get next status
orderStatusSchema.statics.getNextStatus = async function(currentStage) {
  const currentStatus = await this.findOne({ stage: currentStage });
  if (!currentStatus) return null;
  
  return await this.findOne({ order: currentStatus.order + 1 });
};

// Static method to seed initial data
orderStatusSchema.statics.seedData = async function() {
  const count = await this.countDocuments();
  
  if (count === 0) {
    const statuses = [
      { stage: 'Ordered', displayName: 'Order Placed', order: 1 },
      { stage: 'Confirmed', displayName: 'Order Confirmed', order: 2 },
      { stage: 'Packed', displayName: 'Packed', order: 3 },
      { stage: 'Shipped', displayName: 'Shipped', order: 4 },
      { stage: 'Out for Delivery', displayName: 'Out for Delivery', order: 5 },
      { stage: 'Delivered', displayName: 'Delivered', order: 6 }
    ];

    await this.insertMany(statuses);
    console.log('Order statuses seeded successfully');
  }
};

module.exports = mongoose.model('OrderStatus', orderStatusSchema);
