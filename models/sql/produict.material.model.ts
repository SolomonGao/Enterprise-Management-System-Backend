import { Table, Column, ForeignKey, Model, DataType, BelongsTo } from 'sequelize-typescript';
import ProductModel from './product.model';  // 引入 Product 模型
import LeafMaterialModel from './leaf.materials.model';  // 引入 Material 模型

@Table({
  tableName: 'products_to_materials',
  timestamps: false,  // 不使用时间戳
})

export default class ProductMaterialModel extends Model {
  // 外键关联到 ProductModel
  @ForeignKey(() => ProductModel)
  @Column({ onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  products_idproduct!: string; // 使用 string 类型（根据 ProductModel）

  // 外键关联到 LeafMaterialModel
  @ForeignKey(() => LeafMaterialModel)
  @Column({ onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  leaf_materials_drawing_no!: string; // 使用 string 类型（根据 LeafMaterialModel）

  // 存储材料数量
  @Column({
    type: DataType.INTEGER, // 定义为整数
    allowNull: false, // 不允许为空
    defaultValue: 0, // 默认值为 0
  })
  material_counts!: number;

  // 关联 Product 表
  @BelongsTo(() => ProductModel, 'products_idproduct')
  product?: ProductModel;

  // 关联 LeafMaterial 表
  @BelongsTo(() => LeafMaterialModel, 'leaf_materials_drawing_no')
  leafMaterial?: LeafMaterialModel;
}
