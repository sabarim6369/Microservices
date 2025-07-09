const addproduct=async(c)=>{
    try {
        const { name, price, description } = c.body;
        if (!name || !price || !description) {
            return c.status(400).json({ error: 'All fields are required' });
        }

        // Assuming you have a Product model in your Prisma schema
        const product = await prisma.product.create({
            data: { name, price, description },
        });

        return c.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Add product error:', error);
        return c.status(500).json({ error: 'Internal server error' });
    }
} 
const getproduct=async(c)=>{
    try {
        const products = await prisma.product.findMany();
        return c.status(200).json(products);
    } catch (error) {
        console.error('Get products error:', error);
        return c.status(500).json({ error: 'Internal server error' });
    }
}
const getproductbyid=async(c)=>{
    try {
        const productId = parseInt(c.params.id);
        if (isNaN(productId)) {
            return c.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return c.status(404).json({ error: 'Product not found' });
        }

        return c.status(200).json(product);
    } catch (error) {
        console.error('Get product by ID error:', error);
        return c.status(500).json({ error: 'Internal server error' });
    }
}
const updateproduct=async(c)=>{
    try {
        const productId = parseInt(c.params.id);
        if (isNaN(productId)) {
            return c.status(400).json({ error: 'Invalid product ID' });
        }

        const { name, price, description } = c.body;
        if (!name || !price || !description) {
            return c.status(400).json({ error: 'All fields are required' });
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: { name, price, description },
        });

        return c.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error('Update product error:', error);
        return c.status(500).json({ error: 'Internal server error' });
    }
}
const deleteproduct=async(c)=>{
    try {
        const productId = parseInt(c.params.id);
        if (isNaN(productId)) {
            return c.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await prisma.product.delete({
            where: { id: productId },
        });

        return c.status(200).json({ message: 'Product deleted successfully', product });
    } catch (error) {
        console.error('Delete product error:', error);
        return c.status(500).json({ error: 'Internal server error' });
    }
}
const getdata=async(c)=>{
return c.json({message: "Hello from Prot Service!"},200);
}
export {
    addproduct, 
    getproduct,
    getproductbyid,
    updateproduct,
    deleteproduct,
    getdata
};
