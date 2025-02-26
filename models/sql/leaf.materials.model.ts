
import { Model, Table, Column, PrimaryKey, DataType, ForeignKey, BelongsTo, BelongsToMany } from "sequelize-typescript";
import internal from "stream";
import RootMaterialModel from "./root.mateiral.model";
import ProductModel from "./product.model";
import ProductMaterialModel from "./produict.material.model";


interface ILeafMaterial {
    drawing_no_id: string;
    model_name: string;
    row_materials: string;
    drawing_no_public_id?: string,
    drawing_no_secure_url?: string,
    comments: string;
    counts: number;
    purchasing: number;
    name: string;
    specification: string;
    root_materials_idroot_materials: number;
    version: number;

}

@Table({
    tableName: "leaf_materials"
})

export default class LeafMaterialModel extends Model<ILeafMaterial> {

    @PrimaryKey
    @Column({
        unique: true,
    })
    drawing_no_id!: string;

    @Column(DataType.STRING)
    model_name!: string;

    @Column(DataType.STRING)
    name!: string;

    @Column(DataType.STRING)
    row_materials!: string;

    @Column(DataType.STRING)
    comments?: string;
  
    @Column(DataType.INTEGER)
    counts!: number;

    @Column(DataType.INTEGER)
    purchasing!: number;
  
    @Column(DataType.STRING)
    specification?: string;
  
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    drawing_no_public_id?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    drawing_no_secure_url?: string;

    @Column({
        field: "created_at",
    })
    createdAt?: Date;

    @Column({
        field: "updated_at",
    })
    updatedAt?: Date;

    @Column({
        defaultValue: 0,
        allowNull: false,
        type: DataType.INTEGER,
    })
    version!: number;

    @ForeignKey(() => RootMaterialModel)
    @Column
    root_materials_idroot_materials!: number;

    @BelongsTo(() => RootMaterialModel, 'root_materials_idroot_materials')
    rootMaterial?: RootMaterialModel;

    @ForeignKey(() => ProductModel)
    @BelongsToMany(() => ProductModel, () => ProductMaterialModel, 'leaf_materials_drawing_no', 'products_idproduct')
    products?: ProductModel[];
}