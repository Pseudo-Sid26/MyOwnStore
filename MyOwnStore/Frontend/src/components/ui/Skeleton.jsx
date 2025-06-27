const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <Skeleton className="w-full h-48" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="w-full h-96" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
};

export const ProductListSkeleton = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const CartItemSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton className="w-16 h-16" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
};

export const OrderItemSkeleton = () => {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-12 h-12" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="border-t pt-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
