// ProductMaterial.ts (中间表)
import { Table, Column, ForeignKey, Model, Unique, DataType } from 'sequelize-typescript';
import ProductModel from './product.model';  // 引入 Product 模型
import LeafMaterialModel from './leaf.materials.model';  // 引入 Material 模型



@Table ({
    tableName: "prodcuts_to_materials",
    timestamps: false,
})
export default class ProductMaterialModel extends Model {
  @ForeignKey(() => ProductModel)
  @Column({ onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  products_idproduct!: number;

  @ForeignKey(() => LeafMaterialModel)
  @Column({ onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  leaf_materials_drawing_no!: number;
  
  @Column({
    type: DataType.INTEGER, // 定义为整数
    allowNull: false, // 不允许为空
    defaultValue: 0, // 默认值为 0
  })
  material_counts!: number;
}